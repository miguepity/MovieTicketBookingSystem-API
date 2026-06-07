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
  ReembolsoResponse,
  ErrorResponse,
} from '../helpers/response-types';
import { errorCode } from '../helpers/response-types';

async function crearYCancelarPagada(
  request: APIRequestContext,
  token: string,
): Promise<{ idReembolso: string; idsAsiento: string[] }> {
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
  await request.post('/pagos', {
    headers: authHeaders(token),
    data: { id_reserva: reserva.id_reserva, metodo: 'tarjeta' },
  });
  const cancelRes = await request.patch(
    `/reservas/${reserva.id_reserva}/cancelar`,
    { headers: authHeaders(token) },
  );
  const cancel = (await cancelRes.json()) as CancelarReservaResponse;
  if (!cancel.id_reembolso) {
    throw new Error('Esperaba un reembolso creado al cancelar reserva pagada');
  }
  return { idReembolso: cancel.id_reembolso, idsAsiento: ids };
}

test.describe('POST /reembolsos/:id/procesar-efectivo', () => {
  test('happy path: taquillero marca reembolso como procesado', async ({
    request,
  }) => {
    const cliente = await loginAs(request, 'cliente');
    const taquillero = await loginAs(request, 'taquillero');
    const { idReembolso, idsAsiento } = await crearYCancelarPagada(
      request,
      cliente.token,
    );

    const res = await request.post(
      `/reembolsos/${idReembolso}/procesar-efectivo`,
      { headers: authHeaders(taquillero.token) },
    );

    expect(res.status()).toBe(201);
    const body = (await res.json()) as ReembolsoResponse;
    expect(body.estado).toBe('procesado');
    expect(body.fecha_procesado).not.toBeNull();

    for (const id of idsAsiento) await resetAsientoFuncion(id);
  });

  test('rechaza con 403 si el usuario no es taquillero', async ({
    request,
  }) => {
    const cliente = await loginAs(request, 'cliente');
    const { idReembolso, idsAsiento } = await crearYCancelarPagada(
      request,
      cliente.token,
    );

    const res = await request.post(
      `/reembolsos/${idReembolso}/procesar-efectivo`,
      { headers: authHeaders(cliente.token) },
    );

    expect(res.status()).toBe(403);
    const body = (await res.json()) as ErrorResponse;
    expect(errorCode(body)).toBe('ROL_NO_AUTORIZADO');

    for (const id of idsAsiento) await resetAsientoFuncion(id);
  });
});
