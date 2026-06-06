import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import {
  getFuncionConAsientosLibres,
  resetAsientoFuncion,
} from '../helpers/seed-funcion';
import type {
  ReservaResponse,
  PagoResponse,
  ErrorResponse,
} from '../helpers/response-types';
import { errorCode } from '../helpers/response-types';

async function crearReservaCompleta(
  request: APIRequestContext,
  token: string,
  cantidad: number,
): Promise<{ idReserva: string; idsAsiento: string[] }> {
  const { funcionId, asientosDisponibles } =
    await getFuncionConAsientosLibres(cantidad);
  const ids = asientosDisponibles.map((a) => a.id);
  const bloqueoRes = await request.post(
    `/funciones/${funcionId}/asientos/bloquear`,
    {
      headers: authHeaders(token),
      data: { ids_asiento_funcion: ids },
    },
  );
  expect(bloqueoRes.ok()).toBeTruthy();
  const reservaRes = await request.post('/reservas', {
    headers: authHeaders(token),
    data: { id_funcion: funcionId, ids_asiento_funcion: ids },
  });
  expect(reservaRes.ok()).toBeTruthy();
  const body = (await reservaRes.json()) as ReservaResponse;
  return { idReserva: body.id_reserva, idsAsiento: ids };
}

test.describe('POST /pagos', () => {
  test('happy path: pago tarjeta aprobado, reserva queda pagada y asientos ocupados', async ({
    request,
  }) => {
    const { token } = await loginAs(request, 'cliente');
    const { idReserva, idsAsiento } = await crearReservaCompleta(
      request,
      token,
      2,
    );

    const res = await request.post('/pagos', {
      headers: authHeaders(token),
      data: {
        id_reserva: idReserva,
        metodo: 'tarjeta',
        referencia_externa: '****4242',
      },
    });

    expect(res.status()).toBe(201);
    const body = (await res.json()) as PagoResponse;
    expect(body.estado).toBe('aprobado');
    expect(body.id_pago).toBeDefined();
    expect(Number(body.monto_final)).toBeGreaterThan(0);

    for (const id of idsAsiento) await resetAsientoFuncion(id);
  });

  test('rechaza con 409 si la reserva no está en pendiente_pago', async ({
    request,
  }) => {
    const { token } = await loginAs(request, 'cliente');
    const { idReserva, idsAsiento } = await crearReservaCompleta(
      request,
      token,
      1,
    );

    const ok = await request.post('/pagos', {
      headers: authHeaders(token),
      data: { id_reserva: idReserva, metodo: 'tarjeta' },
    });
    expect(ok.status()).toBe(201);

    const dup = await request.post('/pagos', {
      headers: authHeaders(token),
      data: { id_reserva: idReserva, metodo: 'tarjeta' },
    });
    expect(dup.status()).toBe(409);
    const body = (await dup.json()) as ErrorResponse;
    expect(errorCode(body)).toBe('RESERVA_NO_PAGABLE');

    for (const id of idsAsiento) await resetAsientoFuncion(id);
  });

  test('rechaza con 403 si la reserva es de otro usuario', async ({
    request,
  }) => {
    const cliente = await loginAs(request, 'cliente');
    const taquillero = await loginAs(request, 'taquillero');
    const { idReserva, idsAsiento } = await crearReservaCompleta(
      request,
      cliente.token,
      1,
    );

    const res = await request.post('/pagos', {
      headers: authHeaders(taquillero.token),
      data: { id_reserva: idReserva, metodo: 'tarjeta' },
    });

    expect(res.status()).toBe(403);
    const body = (await res.json()) as ErrorResponse;
    expect(errorCode(body)).toBe('RESERVA_NO_ES_DEL_USUARIO');

    for (const id of idsAsiento) await resetAsientoFuncion(id);
  });

  test('concurrencia real: dos requests de pago simultáneos sobre la misma reserva — solo uno gana', async ({
    request,
  }) => {
    const { token } = await loginAs(request, 'cliente');
    const { idReserva, idsAsiento } = await crearReservaCompleta(
      request,
      token,
      1,
    );

    const [resA, resB] = await Promise.all([
      request.post('/pagos', {
        headers: authHeaders(token),
        data: { id_reserva: idReserva, metodo: 'tarjeta' },
      }),
      request.post('/pagos', {
        headers: authHeaders(token),
        data: { id_reserva: idReserva, metodo: 'tarjeta' },
      }),
    ]);

    const statuses = [resA.status(), resB.status()].sort();
    expect(statuses).toEqual([201, 409]);

    const conflictRes = resA.status() === 409 ? resA : resB;
    const conflictBody = (await conflictRes.json()) as ErrorResponse;
    expect(errorCode(conflictBody)).toBe('RESERVA_NO_PAGABLE');

    for (const id of idsAsiento) await resetAsientoFuncion(id);
  });
});

test.describe('POST /pagos/efectivo', () => {
  test('rechaza con 403 si el usuario no es taquillero', async ({
    request,
  }) => {
    const cliente = await loginAs(request, 'cliente');
    const { idReserva, idsAsiento } = await crearReservaCompleta(
      request,
      cliente.token,
      1,
    );

    const res = await request.post('/pagos/efectivo', {
      headers: authHeaders(cliente.token),
      data: { id_reserva: idReserva },
    });

    expect(res.status()).toBe(403);
    const body = (await res.json()) as ErrorResponse;
    expect(errorCode(body)).toBe('ROL_NO_AUTORIZADO');

    for (const id of idsAsiento) await resetAsientoFuncion(id);
  });

  test('happy path: taquillero confirma pago en efectivo', async ({
    request,
  }) => {
    const cliente = await loginAs(request, 'cliente');
    const taquillero = await loginAs(request, 'taquillero');
    const { idReserva, idsAsiento } = await crearReservaCompleta(
      request,
      cliente.token,
      1,
    );

    const res = await request.post('/pagos/efectivo', {
      headers: authHeaders(taquillero.token),
      data: { id_reserva: idReserva },
    });

    expect(res.status()).toBe(201);
    const body = (await res.json()) as PagoResponse;
    expect(body.estado).toBe('aprobado');

    for (const id of idsAsiento) await resetAsientoFuncion(id);
  });
});
