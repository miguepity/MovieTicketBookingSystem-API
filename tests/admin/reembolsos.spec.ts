import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import {
  seedFuncionConReserva,
  cleanupReservaSeed,
} from '../helpers/seed-funcion';
import type { ReservaSeed } from '../helpers/seed-funcion';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function prisma() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
}

// ─── Helper: seed a reembolso pendiente ──────────────────────────────────────

async function seedReembolsoPendiente(clienteUserId: string): Promise<{
  seed: ReservaSeed;
  reembolsoId: string;
}> {
  const seed = await seedFuncionConReserva(clienteUserId, { pagada: true });

  // Cancel the reserva via API (which creates the reembolso)
  // Or create directly via Prisma
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

    return { seed, reembolsoId: reembolso.id.toString() };
  } finally {
    await p.$disconnect();
  }
}

// ─── 1. Autenticación ────────────────────────────────────────────────────────

test.describe('GET /admin/reembolsos — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.get('/admin/reembolsos');
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const res = await request.get('/admin/reembolsos', {
      headers: authHeaders(auth.token),
    });
    expect(res.status()).toBe(403);
  });
});

// ─── 2. Listado paginado ─────────────────────────────────────────────────────

test.describe('GET /admin/reembolsos — lista paginada', () => {
  let seed: ReservaSeed;
  let reembolsoId: string;
  let adminToken: string;
  let clienteUserId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    const cliente = await loginAs(request, 'cliente');
    clienteUserId = cliente.userId;

    const result = await seedReembolsoPendiente(clienteUserId);
    seed = result.seed;
    reembolsoId = result.reembolsoId;
  });

  test.afterAll(async () => {
    const p = prisma();
    try {
      await p.reembolsos.deleteMany({
        where: { pagos: { id_reserva: BigInt(seed.idReserva) } },
      });
    } finally {
      await p.$disconnect();
    }
    await cleanupReservaSeed(seed);
  });

  test('200 lista paginada con shape { data, total, page, limit }', async ({ request }) => {
    const res = await request.get('/admin/reembolsos?page=1&limit=10', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      page: 1,
      limit: 10,
      total: expect.any(Number),
      data: expect.any(Array),
    });
    expect(body.total).toBeGreaterThanOrEqual(0);
  });

  test('200 items contienen campos enriquecidos', async ({ request }) => {
    const res = await request.get('/admin/reembolsos?page=1&limit=50', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();

    const item = body.data.find((r: any) => r.id === reembolsoId);
    expect(item).toBeDefined();
    expect(item).toMatchObject({
      id: reembolsoId,
      numero_reserva: seed.numero,
      cliente: {
        email: expect.any(String),
        nombre: expect.any(String),
      },
      pelicula: { titulo: expect.any(String) },
      cine: { nombre: expect.any(String) },
      metodo_pago_original: expect.any(String),
      monto: expect.any(String),
      porcentaje_aplicado: expect.any(String),
      dias_en_cola: expect.any(Number),
      estado: 'pendiente',
    });
  });

  test('200 filtro por estado=pendiente devuelve solo pendientes', async ({ request }) => {
    const res = await request.get('/admin/reembolsos?estado=pendiente&page=1&limit=50', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const r of body.data) {
      expect(r.estado).toBe('pendiente');
    }
  });
});

// ─── 3. Detalle ──────────────────────────────────────────────────────────────

test.describe('GET /admin/reembolsos/:id — detalle', () => {
  let seed: ReservaSeed;
  let reembolsoId: string;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    const cliente = await loginAs(request, 'cliente');
    const result = await seedReembolsoPendiente(cliente.userId);
    seed = result.seed;
    reembolsoId = result.reembolsoId;
  });

  test.afterAll(async () => {
    const p = prisma();
    try {
      await p.reembolsos.deleteMany({
        where: { pagos: { id_reserva: BigInt(seed.idReserva) } },
      });
    } finally {
      await p.$disconnect();
    }
    await cleanupReservaSeed(seed);
  });

  test('200 detalle completo del reembolso', async ({ request }) => {
    const res = await request.get(`/admin/reembolsos/${reembolsoId}`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      id: reembolsoId,
      numero_reserva: seed.numero,
      cliente: { email: expect.any(String) },
      pelicula: { titulo: expect.any(String) },
      cine: { nombre: expect.any(String) },
      estado: 'pendiente',
      monto: expect.any(String),
    });
  });

  test('404 para ID inexistente', async ({ request }) => {
    const res = await request.get('/admin/reembolsos/999999999999', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(404);
  });

  test('403 si cliente intenta acceder a detalle admin', async ({ request }) => {
    const cliente = await loginAs(request, 'cliente');
    const res = await request.get(`/admin/reembolsos/${reembolsoId}`, {
      headers: authHeaders(cliente.token),
    });
    expect(res.status()).toBe(403);
  });
});

// ─── 4. KPIs ─────────────────────────────────────────────────────────────────

test.describe('GET /admin/reembolsos/kpis', () => {
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
  });

  test('401 sin token', async ({ request }) => {
    const res = await request.get('/admin/reembolsos/kpis');
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const cliente = await loginAs(request, 'cliente');
    const res = await request.get('/admin/reembolsos/kpis', {
      headers: authHeaders(cliente.token),
    });
    expect(res.status()).toBe(403);
  });

  test('200 KPIs con shape correcto', async ({ request }) => {
    const res = await request.get('/admin/reembolsos/kpis', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      pendientes: expect.any(Number),
      en_procesamiento: expect.any(Number),
      monto_pendiente: expect.any(String),
      completados_30d: expect.any(Number),
    });
  });
});

// ─── 5. Procesar ─────────────────────────────────────────────────────────────

test.describe('PATCH /admin/reembolsos/:id/procesar', () => {
  let seed: ReservaSeed;
  let reembolsoId: string;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    const cliente = await loginAs(request, 'cliente');
    const result = await seedReembolsoPendiente(cliente.userId);
    seed = result.seed;
    reembolsoId = result.reembolsoId;
  });

  test.afterAll(async () => {
    const p = prisma();
    try {
      await p.reembolsos.deleteMany({
        where: { pagos: { id_reserva: BigInt(seed.idReserva) } },
      });
    } finally {
      await p.$disconnect();
    }
    await cleanupReservaSeed(seed);
  });

  test('200 procesar exitoso — estado=procesado y fecha_procesado set', async ({ request }) => {
    const res = await request.patch(`/admin/reembolsos/${reembolsoId}/procesar`, {
      headers: authHeaders(adminToken),
      data: { nota: 'Procesado por transferencia bancaria' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      id: reembolsoId,
      estado: 'procesado',
      fecha_procesado: expect.any(String),
      nota: 'Procesado por transferencia bancaria',
    });
    expect(body.fecha_procesado).not.toBeNull();
  });

  test('409 si ya está procesado', async ({ request }) => {
    // Already procesado from previous test
    const res = await request.patch(`/admin/reembolsos/${reembolsoId}/procesar`, {
      headers: authHeaders(adminToken),
      data: {},
    });
    expect(res.status()).toBe(409);
  });
});

// ─── 6. Rechazar ─────────────────────────────────────────────────────────────

test.describe('PATCH /admin/reembolsos/:id/rechazar', () => {
  let seed: ReservaSeed;
  let reembolsoId: string;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    const cliente = await loginAs(request, 'cliente');
    const result = await seedReembolsoPendiente(cliente.userId);
    seed = result.seed;
    reembolsoId = result.reembolsoId;
  });

  test.afterAll(async () => {
    const p = prisma();
    try {
      await p.reembolsos.deleteMany({
        where: { pagos: { id_reserva: BigInt(seed.idReserva) } },
      });
    } finally {
      await p.$disconnect();
    }
    await cleanupReservaSeed(seed);
  });

  test('200 rechazar con motivo — estado=rechazado y motivo_rechazo set', async ({ request }) => {
    const res = await request.patch(`/admin/reembolsos/${reembolsoId}/rechazar`, {
      headers: authHeaders(adminToken),
      data: { motivo: 'Documentación insuficiente proporcionada' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      id: reembolsoId,
      estado: 'rechazado',
      motivo_rechazo: 'Documentación insuficiente proporcionada',
    });
  });

  test('409 si ya está rechazado (no es pendiente)', async ({ request }) => {
    // Already rechazado from previous test
    const res = await request.patch(`/admin/reembolsos/${reembolsoId}/rechazar`, {
      headers: authHeaders(adminToken),
      data: { motivo: 'Otro motivo de rechazo' },
    });
    expect(res.status()).toBe(409);
  });

  test('400 si motivo es muy corto (< 3 chars)', async ({ request }) => {
    // Need a fresh pendiente reembolso for this test, skip check — we'll just verify validation
    // Actually just test with an existing one — validation error should come before state check
    const p = prisma();
    let testId: string;
    let testSeed: ReservaSeed | null = null;
    try {
      const cliente = await loginAs(request, 'cliente');
      const result = await seedReembolsoPendiente(cliente.userId);
      testSeed = result.seed;
      testId = result.reembolsoId;
    } finally {
      await p.$disconnect();
    }

    const res = await request.patch(`/admin/reembolsos/${testId}/rechazar`, {
      headers: authHeaders(adminToken),
      data: { motivo: 'ab' },
    });
    expect(res.status()).toBe(400);

    // Cleanup
    if (testSeed) {
      const p2 = prisma();
      try {
        await p2.reembolsos.deleteMany({
          where: { pagos: { id_reserva: BigInt(testSeed.idReserva) } },
        });
      } finally {
        await p2.$disconnect();
      }
      await cleanupReservaSeed(testSeed);
    }
  });
});
