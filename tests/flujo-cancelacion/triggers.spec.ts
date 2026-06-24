import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import {
  getFuncionConAsientosLibres,
  resetAsientoFuncion,
} from '../helpers/seed-funcion';
import type {
  ReservaResponse,
  PagoResponse,
  CancelarReservaResponse,
} from '../helpers/response-types';

test.describe('triggers de email', () => {
  test('pago.exitoso: el endpoint /pagos sigue retornando 201 con el listener registrado', async ({
    request,
  }) => {
    const { token } = await loginAs(request, 'cliente');
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

    const pagoRes = await request.post('/pagos', {
      headers: authHeaders(token),
      data: { id_reserva: reserva.id_reserva, metodo: 'tarjeta' },
    });

    expect(pagoRes.status()).toBe(201);
    const pago = (await pagoRes.json()) as PagoResponse;
    expect(pago.estado).toBe('exitoso');

    for (const id of ids) await resetAsientoFuncion(id);
  });

  test('reserva.cancelada: PATCH /reservas/:id/cancelar sigue retornando 200 con el listener registrado', async ({
    request,
  }) => {
    const { token } = await loginAs(request, 'cliente');
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

    const cancelRes = await request.patch(
      `/reservas/${reserva.id_reserva}/cancelar`,
      { headers: authHeaders(token) },
    );

    expect(cancelRes.status()).toBe(200);
    const cancel = (await cancelRes.json()) as CancelarReservaResponse;
    expect(cancel.estado).toBe('cancelada');

    for (const id of ids) await resetAsientoFuncion(id);
  });
});
