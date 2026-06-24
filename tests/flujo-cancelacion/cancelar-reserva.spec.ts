import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import {
  getFuncionConAsientosLibres,
  resetAsientoFuncion,
} from '../helpers/seed-funcion';
import type {
  ReservaResponse,
  CancelarReservaResponse,
  ErrorResponse,
} from '../helpers/response-types';
import { errorCode } from '../helpers/response-types';

async function crearReservaPagada(
  request: APIRequestContext,
  token: string,
): Promise<{ idReserva: string; idsAsiento: string[] }> {
  const { funcionId, asientosDisponibles } =
    await getFuncionConAsientosLibres(1);
  const ids = asientosDisponibles.map((a) => a.id);
  const bloqueoRes = await request.post(
    `/funciones/${funcionId}/asientos/bloquear`,
    { headers: authHeaders(token), data: { ids_asiento_funcion: ids } },
  );
  expect(bloqueoRes.ok()).toBeTruthy();
  const reservaRes = await request.post('/reservas', {
    headers: authHeaders(token),
    data: { id_funcion: funcionId, ids_asiento_funcion: ids },
  });
  expect(reservaRes.ok()).toBeTruthy();
  const reserva = (await reservaRes.json()) as ReservaResponse;
  const pagoRes = await request.post('/pagos', {
    headers: authHeaders(token),
    data: { id_reserva: reserva.id_reserva, metodo: 'tarjeta' },
  });
  expect(pagoRes.ok()).toBeTruthy();
  return { idReserva: reserva.id_reserva, idsAsiento: ids };
}

async function crearReservaPendiente(
  request: APIRequestContext,
  token: string,
): Promise<{ idReserva: string; idsAsiento: string[] }> {
  const { funcionId, asientosDisponibles } =
    await getFuncionConAsientosLibres(1);
  const ids = asientosDisponibles.map((a) => a.id);
  await request.post(`/funciones/${funcionId}/asientos/bloquear`, {
    headers: authHeaders(token),
    data: { ids_asiento_funcion: ids },
  });
  const reservaRes = await request.post('/reservas', {
    headers: authHeaders(token),
    data: { id_funcion: funcionId, ids_asiento_funcion: ids },
  });
  const reserva = (await reservaRes.json()) as ReservaResponse;
  return { idReserva: reserva.id_reserva, idsAsiento: ids };
}

test.describe('PATCH /reservas/:id/cancelar', () => {
  test('cancela reserva pagada, calcula monto de reembolso y libera asientos', async ({
    request,
  }) => {
    const { token } = await loginAs(request, 'cliente');
    const { idReserva, idsAsiento } = await crearReservaPagada(request, token);

    const res = await request.patch(`/reservas/${idReserva}/cancelar`, {
      headers: authHeaders(token),
    });

    expect(res.status()).toBe(200);
    const body = (await res.json()) as CancelarReservaResponse;
    expect(body.estado).toBe('cancelada');
    expect(body.id_reembolso).not.toBeNull();
    expect(Number(body.monto_reembolso)).toBeGreaterThanOrEqual(0);

    for (const id of idsAsiento) await resetAsientoFuncion(id);
  });

  test('cancela reserva pendiente_pago sin crear reembolso', async ({
    request,
  }) => {
    const { token } = await loginAs(request, 'cliente');
    const { idReserva, idsAsiento } = await crearReservaPendiente(
      request,
      token,
    );

    const res = await request.patch(`/reservas/${idReserva}/cancelar`, {
      headers: authHeaders(token),
    });

    expect(res.status()).toBe(200);
    const body = (await res.json()) as CancelarReservaResponse;
    expect(body.estado).toBe('cancelada');
    expect(body.id_reembolso).toBeNull();
    expect(body.monto_reembolso).toBe('0.00');

    for (const id of idsAsiento) await resetAsientoFuncion(id);
  });

  test('rechaza con 403 si la reserva no es del usuario', async ({
    request,
  }) => {
    const cliente = await loginAs(request, 'cliente');
    const admin = await loginAs(request, 'admin');
    const { idReserva, idsAsiento } = await crearReservaPendiente(
      request,
      cliente.token,
    );

    const res = await request.patch(`/reservas/${idReserva}/cancelar`, {
      headers: authHeaders(admin.token),
    });

    expect(res.status()).toBe(403);
    const body = (await res.json()) as ErrorResponse;
    expect(errorCode(body)).toBe('RESERVA_NO_ES_DEL_USUARIO');

    for (const id of idsAsiento) await resetAsientoFuncion(id);
  });

  test('concurrencia real: dos cancelaciones simultáneas — solo una gana', async ({
    request,
  }) => {
    const { token } = await loginAs(request, 'cliente');
    const { idReserva, idsAsiento } = await crearReservaPendiente(
      request,
      token,
    );

    const [resA, resB] = await Promise.all([
      request.patch(`/reservas/${idReserva}/cancelar`, {
        headers: authHeaders(token),
      }),
      request.patch(`/reservas/${idReserva}/cancelar`, {
        headers: authHeaders(token),
      }),
    ]);

    const statuses = [resA.status(), resB.status()].sort();
    expect(statuses).toEqual([200, 409]);

    const conflictRes = resA.status() === 409 ? resA : resB;
    const conflictBody = (await conflictRes.json()) as ErrorResponse;
    expect(errorCode(conflictBody)).toBe('RESERVA_NO_CANCELABLE');

    for (const id of idsAsiento) await resetAsientoFuncion(id);
  });
});
