import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import {
  getFuncionConAsientosLibres,
  setBloqueadoHasta,
  resetAsientoFuncion,
} from '../helpers/seed-funcion';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

test('lazy cleanup libera asientos bloqueados expirados al consultar el mapa', async ({
  request,
}) => {
  const { token, userId } = await loginAs(request, 'cliente');
  const { funcionId, asientosDisponibles } = await getFuncionConAsientosLibres(1);
  const asientoId = asientosDisponibles[0].id;

  await prisma.asientosFuncion.update({
    where: { id: BigInt(asientoId) },
    data: { estado: 'bloqueado', id_usuario: BigInt(userId) },
  });
  await setBloqueadoHasta(asientoId, new Date(Date.now() - 60_000));

  const res = await request.get(`/funciones/${funcionId}/asientos`, {
    headers: authHeaders(token),
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  const asiento = body.asientos.find((a: { id_asiento_funcion: string }) => a.id_asiento_funcion === asientoId);
  expect(asiento).toBeDefined();
  expect(asiento.estado).toBe('disponible');

  await resetAsientoFuncion(asientoId);
});
