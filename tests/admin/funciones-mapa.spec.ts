// tests/admin/funciones-mapa.spec.ts
import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import {
  getFuncionConAsientosLibres,
  setBloqueadoHasta,
  resetAsientoFuncion,
} from '../helpers/seed-funcion';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import type { AdminMapaAsientosResponseDto } from '../../src/modules/funciones/dto/admin-mapa-asientos.response.dto';

function prisma() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
}

test.describe('GET /admin/funciones/:id/asientos — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.get('/admin/funciones/1/asientos');
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const res = await request.get('/admin/funciones/1/asientos', {
      headers: authHeaders(auth.token),
    });
    expect(res.status()).toBe(403);
  });
});

test.describe('GET /admin/funciones/:id/asientos — errores', () => {
  test('404 con función inexistente', async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    const res = await request.get('/admin/funciones/999999999/asientos', {
      headers: authHeaders(admin.token),
    });
    expect(res.status()).toBe(404);
    const body = (await res.json()) as {
      code?: string;
      message?: { code?: string };
    };
    expect(body.code ?? body.message?.code).toBe('FUNCION_NO_ENCONTRADA');
  });
});

test.describe('GET /admin/funciones/:id/asientos — happy path', () => {
  let adminToken: string;
  let funcionId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
    const seed = await getFuncionConAsientosLibres(1);
    funcionId = seed.funcionId;
  });

  test('shape correcto y campos por asiento', async ({ request }) => {
    const res = await request.get(`/admin/funciones/${funcionId}/asientos`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as AdminMapaAsientosResponseDto;

    expect(body.funcion_id).toBe(funcionId);
    expect(body.sala).toMatchObject({
      filas: expect.any(Number),
      columnas: expect.any(Number),
    });
    expect(Array.isArray(body.asientos)).toBe(true);
    expect(body.asientos.length).toBeGreaterThan(0);

    const first = body.asientos[0];
    expect(first).toMatchObject({
      id_asiento_funcion: expect.any(String),
      fila: expect.any(String),
      columna: expect.any(Number),
      codigo: expect.any(String),
      tipo: expect.any(String),
      estado: expect.stringMatching(
        /^(disponible|bloqueado|reservado|ocupado)$/,
      ),
      precio: expect.any(Number),
    });
    expect(first).toHaveProperty('color');
    expect(first).toHaveProperty('usuario');
    expect(first).toHaveProperty('bloqueado_hasta');
  });
});

test.describe('GET /admin/funciones/:id/asientos — estado calculado', () => {
  let adminToken: string;
  let funcionId: string;
  let asientoId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
    const seed = await getFuncionConAsientosLibres(1);
    funcionId = seed.funcionId;
    asientoId = seed.asientosDisponibles[0].id;

    // Marcar asiento como bloqueado con bloqueado_hasta YA expirado
    const p = prisma();
    try {
      const cliente = await loginAs(request, 'cliente');
      await p.asientosFuncion.update({
        where: { id: BigInt(asientoId) },
        data: {
          estado: 'bloqueado',
          id_usuario: BigInt(cliente.userId),
          bloqueado_hasta: new Date(Date.now() - 60_000), // 1 min en el pasado
        },
      });
    } finally {
      await p.$disconnect();
    }
  });

  test.afterAll(async () => {
    await resetAsientoFuncion(asientoId);
  });

  test('bloqueado con bloqueado_hasta vencido se reporta como disponible', async ({
    request,
  }) => {
    const res = await request.get(`/admin/funciones/${funcionId}/asientos`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as AdminMapaAsientosResponseDto;
    const asiento = body.asientos.find(
      (a) => a.id_asiento_funcion === asientoId,
    );
    expect(asiento).toBeDefined();
    expect(asiento!.estado).toBe('disponible');
    expect(asiento!.usuario).toBeNull();
    expect(asiento!.bloqueado_hasta).toBeNull();
  });

  test('NO muta DB: el asiento sigue como bloqueado raw después del request', async () => {
    const p = prisma();
    try {
      const row = await p.asientosFuncion.findUnique({
        where: { id: BigInt(asientoId) },
        select: { estado: true, id_usuario: true },
      });
      expect(row?.estado).toBe('bloqueado');
      expect(row?.id_usuario).not.toBeNull();
    } finally {
      await p.$disconnect();
    }
  });
});

test.describe('GET /admin/funciones/:id/asientos — usuario poblado', () => {
  let adminToken: string;
  let funcionId: string;
  let asientoId: string;
  let clienteEmail: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
    const cliente = await loginAs(request, 'cliente');
    clienteEmail = cliente.email;

    const seed = await getFuncionConAsientosLibres(1);
    funcionId = seed.funcionId;
    asientoId = seed.asientosDisponibles[0].id;

    // Bloquear con bloqueado_hasta en el FUTURO (válido)
    await setBloqueadoHasta(asientoId, new Date(Date.now() + 600_000));
    const p = prisma();
    try {
      await p.asientosFuncion.update({
        where: { id: BigInt(asientoId) },
        data: { estado: 'bloqueado', id_usuario: BigInt(cliente.userId) },
      });
    } finally {
      await p.$disconnect();
    }
  });

  test.afterAll(async () => {
    await resetAsientoFuncion(asientoId);
  });

  test('asiento bloqueado vigente expone usuario {id, email} y bloqueado_hasta', async ({
    request,
  }) => {
    const res = await request.get(`/admin/funciones/${funcionId}/asientos`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as AdminMapaAsientosResponseDto;
    const asiento = body.asientos.find(
      (a) => a.id_asiento_funcion === asientoId,
    );
    expect(asiento).toBeDefined();
    expect(asiento!.estado).toBe('bloqueado');
    expect(asiento!.usuario).toMatchObject({
      id: expect.any(String),
      email: clienteEmail,
    });
    expect(asiento!.bloqueado_hasta).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });
});
