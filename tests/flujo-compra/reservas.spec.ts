import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import {
  getFuncionConAsientosLibres,
  setBloqueadoHasta,
  resetAsientoFuncion,
} from '../helpers/seed-funcion';
import type { ReservaResponse, ErrorResponse } from '../helpers/response-types';
import { errorCode } from '../helpers/response-types';

async function bloquear(
  request: APIRequestContext,
  token: string,
  funcionId: string,
  ids: string[],
) {
  const res = await request.post(`/funciones/${funcionId}/asientos/bloquear`, {
    headers: authHeaders(token),
    data: { ids_asiento_funcion: ids },
  });
  if (!res.ok()) {
    throw new Error(`bloquear falló: ${res.status()} ${await res.text()}`);
  }
}

test.describe('POST /reservas', () => {
  test('happy path: convierte bloqueo en reserva pendiente_pago', async ({
    request,
  }) => {
    const { token } = await loginAs(request, 'cliente');
    const { funcionId, asientosDisponibles } =
      await getFuncionConAsientosLibres(2);
    const ids = asientosDisponibles.map((a) => a.id);
    await bloquear(request, token, funcionId, ids);

    const res = await request.post('/reservas', {
      headers: authHeaders(token),
      data: { id_funcion: funcionId, ids_asiento_funcion: ids },
    });

    expect(res.status()).toBe(201);
    const body = (await res.json()) as ReservaResponse;
    expect(body.estado).toBe('pendiente_pago');
    expect(body.numero_reserva).toMatch(/^RES-\d{8}-[A-Z0-9]{5}$/);
    expect(body.asientos).toHaveLength(2);
    expect(Number(body.total_estimado)).toBeGreaterThan(0);

    for (const id of ids) await resetAsientoFuncion(id);
  });

  test('rechaza con 409 si el bloqueo ya expiró', async ({ request }) => {
    const { token } = await loginAs(request, 'cliente');
    const { funcionId, asientosDisponibles } =
      await getFuncionConAsientosLibres(1);
    const ids = [asientosDisponibles[0].id];
    await bloquear(request, token, funcionId, ids);
    await setBloqueadoHasta(ids[0], new Date(Date.now() - 60_000));

    const res = await request.post('/reservas', {
      headers: authHeaders(token),
      data: { id_funcion: funcionId, ids_asiento_funcion: ids },
    });

    expect(res.status()).toBe(409);
    const body = (await res.json()) as ErrorResponse;
    expect(errorCode(body)).toBe('BLOQUEO_EXPIRADO');

    await resetAsientoFuncion(ids[0]);
  });

  test('rechaza con 403 si el bloqueo es de otro usuario', async ({
    request,
  }) => {
    const cliente = await loginAs(request, 'cliente');
    const admin = await loginAs(request, 'admin');
    const { funcionId, asientosDisponibles } =
      await getFuncionConAsientosLibres(1);
    const ids = [asientosDisponibles[0].id];
    await bloquear(request, cliente.token, funcionId, ids);

    const res = await request.post('/reservas', {
      headers: authHeaders(admin.token),
      data: { id_funcion: funcionId, ids_asiento_funcion: ids },
    });

    expect(res.status()).toBe(403);
    const body = (await res.json()) as ErrorResponse;
    expect(errorCode(body)).toBe('BLOQUEO_NO_ES_DEL_USUARIO');

    await resetAsientoFuncion(ids[0]);
  });
});
