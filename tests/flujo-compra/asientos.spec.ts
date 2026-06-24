import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import {
  getFuncionConAsientosLibres,
  resetAsientoFuncion,
} from '../helpers/seed-funcion';
import type {
  MapaResponse,
  BloquearResponse,
  ErrorResponse,
} from '../helpers/response-types';
import { errorCode } from '../helpers/response-types';

test.describe('GET /funciones/:id/asientos', () => {
  test('devuelve el mapa visual con estado de cada asiento', async ({
    request,
  }) => {
    const { token } = await loginAs(request, 'cliente');
    const { funcionId } = await getFuncionConAsientosLibres(1);

    const res = await request.get(`/funciones/${funcionId}/asientos`, {
      headers: authHeaders(token),
    });

    expect(res.status()).toBe(200);
    const body = (await res.json()) as MapaResponse;
    expect(body.funcion_id).toBe(funcionId);
    expect(body.sala).toHaveProperty('filas');
    expect(body.sala).toHaveProperty('columnas');
    expect(Array.isArray(body.asientos)).toBe(true);
    expect(body.asientos.length).toBeGreaterThan(0);
    const primer = body.asientos[0];
    expect(primer).toHaveProperty('id_asiento_funcion');
    expect(primer).toHaveProperty('fila');
    expect(primer).toHaveProperty('columna');
    expect(primer).toHaveProperty('codigo');
    expect(primer).toHaveProperty('tipo');
    expect(primer).toHaveProperty('estado');
    expect(primer).toHaveProperty('es_mio');
  });

  test('devuelve 404 si la función no existe', async ({ request }) => {
    const { token } = await loginAs(request, 'cliente');
    const res = await request.get(`/funciones/99999999/asientos`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(404);
  });
});

test.describe('POST /funciones/:id/asientos/bloquear', () => {
  test('happy path: bloquea asientos y retorna bloqueado_hasta', async ({
    request,
  }) => {
    const { token } = await loginAs(request, 'cliente');
    const { funcionId, asientosDisponibles } =
      await getFuncionConAsientosLibres(2);
    const ids = asientosDisponibles.map((a) => a.id);

    const res = await request.post(
      `/funciones/${funcionId}/asientos/bloquear`,
      {
        headers: authHeaders(token),
        data: { ids_asiento_funcion: ids },
      },
    );

    expect(res.status()).toBe(200);
    const body = (await res.json()) as BloquearResponse;
    expect(body.bloqueados).toEqual(expect.arrayContaining(ids));
    expect(new Date(body.bloqueado_hasta).getTime()).toBeGreaterThan(
      Date.now(),
    );

    for (const id of ids) await resetAsientoFuncion(id);
  });

  test('rechaza con 400 si excede el límite de 10 asientos', async ({
    request,
  }) => {
    const { token } = await loginAs(request, 'cliente');
    const { funcionId } = await getFuncionConAsientosLibres(1);
    const ids = Array.from({ length: 11 }, (_, i) => String(i + 1));

    const res = await request.post(
      `/funciones/${funcionId}/asientos/bloquear`,
      {
        headers: authHeaders(token),
        data: { ids_asiento_funcion: ids },
      },
    );

    expect(res.status()).toBe(400);
  });

  test('rechaza con 409 si algún asiento ya está bloqueado por otro', async ({
    request,
  }) => {
    const cliente = await loginAs(request, 'cliente');
    const admin = await loginAs(request, 'admin');
    const { funcionId, asientosDisponibles } =
      await getFuncionConAsientosLibres(1);
    const ids = [asientosDisponibles[0].id];

    const ok = await request.post(`/funciones/${funcionId}/asientos/bloquear`, {
      headers: authHeaders(cliente.token),
      data: { ids_asiento_funcion: ids },
    });
    expect(ok.status()).toBe(200);

    const conflict = await request.post(
      `/funciones/${funcionId}/asientos/bloquear`,
      {
        headers: authHeaders(admin.token),
        data: { ids_asiento_funcion: ids },
      },
    );
    expect(conflict.status()).toBe(409);
    const body = (await conflict.json()) as ErrorResponse;
    expect(errorCode(body)).toBe('ASIENTO_NO_DISPONIBLE');

    for (const id of ids) await resetAsientoFuncion(id);
  });

  test('concurrencia real: dos usuarios disparan bloqueo al mismo tiempo sobre el mismo asiento — solo uno gana', async ({
    request,
  }) => {
    const cliente = await loginAs(request, 'cliente');
    const admin = await loginAs(request, 'admin');
    const { funcionId, asientosDisponibles } =
      await getFuncionConAsientosLibres(1);
    const ids = [asientosDisponibles[0].id];

    const [resA, resB] = await Promise.all([
      request.post(`/funciones/${funcionId}/asientos/bloquear`, {
        headers: authHeaders(cliente.token),
        data: { ids_asiento_funcion: ids },
      }),
      request.post(`/funciones/${funcionId}/asientos/bloquear`, {
        headers: authHeaders(admin.token),
        data: { ids_asiento_funcion: ids },
      }),
    ]);

    const statuses = [resA.status(), resB.status()].sort();
    expect(statuses).toEqual([200, 409]);

    const conflictRes = resA.status() === 409 ? resA : resB;
    const conflictBody = (await conflictRes.json()) as ErrorResponse;
    expect(errorCode(conflictBody)).toBe('ASIENTO_NO_DISPONIBLE');

    for (const id of ids) await resetAsientoFuncion(id);
  });
});
