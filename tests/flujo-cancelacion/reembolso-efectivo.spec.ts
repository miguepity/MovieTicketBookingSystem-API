import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import {
  seedFuncionConReserva,
  cleanupReservaSeed,
  resetAsientoFuncion,
  getFuncionConAsientosLibres,
} from '../helpers/seed-funcion';
import type {
  ReservaResponse,
  CancelarReservaResponse,
  ErrorResponse,
} from '../helpers/response-types';
import { errorCode } from '../helpers/response-types';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function prisma() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
}

// ─── Helper: seed a reembolso pendiente via Prisma (reliable, bypass policy) ──

async function crearYCancelarPagada(
  request: APIRequestContext,
  token: string,
  userId: string,
): Promise<{ idReembolso: string; idsAsiento: string[] }> {
  const seed = await seedFuncionConReserva(userId, { pagada: true });

  const p = prisma();
  try {
    const pago = await p.pagos.findFirst({
      where: { id_reserva: BigInt(seed.idReserva) },
    });
    if (!pago) throw new Error('No pago found for seeded reserva');

    const reembolso = await p.reembolsos.create({
      data: {
        id_pago: pago.id,
        porcentaje_aplicado: 100,
        monto: pago.monto_final,
        estado: 'pendiente',
      },
    });

    return {
      idReembolso: reembolso.id.toString(),
      idsAsiento: seed.idsAsiento,
    };
  } finally {
    await p.$disconnect();
  }
}

test.describe('PATCH /admin/reembolsos/:id/procesar', () => {
  test('happy path: admin marca reembolso como procesado', async ({
    request,
  }) => {
    const cliente = await loginAs(request, 'cliente');
    const admin = await loginAs(request, 'admin');
    const { idReembolso, idsAsiento } = await crearYCancelarPagada(
      request,
      cliente.token,
      cliente.userId,
    );

    const res = await request.patch(
      `/admin/reembolsos/${idReembolso}/procesar`,
      { headers: authHeaders(admin.token) },
    );

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.estado).toBe('procesado');
    expect(body.fecha_procesado).not.toBeNull();

    for (const id of idsAsiento) await resetAsientoFuncion(id);
  });

  test('rechaza con 403 si el usuario no es admin', async ({
    request,
  }) => {
    const cliente = await loginAs(request, 'cliente');
    const { idReembolso, idsAsiento } = await crearYCancelarPagada(
      request,
      cliente.token,
      cliente.userId,
    );

    const res = await request.patch(
      `/admin/reembolsos/${idReembolso}/procesar`,
      { headers: authHeaders(cliente.token) },
    );

    expect(res.status()).toBe(403);
    const body = (await res.json()) as ErrorResponse;
    expect(errorCode(body)).toBe('ROL_NO_AUTORIZADO');

    for (const id of idsAsiento) await resetAsientoFuncion(id);
  });
});
