import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import {
  seedFuncionConReserva,
  cleanupReservaSeed,
} from '../helpers/seed-funcion';
import type { ReservaSeed } from '../helpers/seed-funcion';

// ─── 1. Autenticación ────────────────────────────────────────────────────────

test.describe('GET /admin/reservas — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.get('/admin/reservas');
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const res = await request.get('/admin/reservas', {
      headers: authHeaders(auth.token),
    });
    expect(res.status()).toBe(403);
  });
});

// ─── 2. Listado paginado (admin) ─────────────────────────────────────────────

test.describe('GET /admin/reservas — lista paginada', () => {
  let seed: ReservaSeed;
  let adminToken: string;
  let clienteUserId: string;
  let clienteEmail: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    const cliente = await loginAs(request, 'cliente');
    clienteUserId = cliente.userId;
    clienteEmail = cliente.email;

    seed = await seedFuncionConReserva(clienteUserId);
  });

  test.afterAll(async () => {
    await cleanupReservaSeed(seed);
  });

  test('200 lista paginada con shape { data, total, page, limit }', async ({ request }) => {
    const res = await request.get('/admin/reservas?page=1&limit=10', {
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
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.total).toBeGreaterThanOrEqual(body.data.length);
  });

  test('200 items contienen cliente y pelicula enriquecidos', async ({ request }) => {
    const res = await request.get(`/admin/reservas?page=1&limit=50`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();

    // Find the seeded reserva
    const item = body.data.find((r: any) => r.numero_reserva === seed.numero);
    expect(item).toBeDefined();
    expect(item).toMatchObject({
      numero_reserva: seed.numero,
      estado: 'pendiente_pago',
      cliente: {
        email: clienteEmail,
        nombre: expect.any(String),
      },
      pelicula: { titulo: expect.any(String) },
      cine: { nombre: expect.any(String) },
      sala: { nombre: expect.any(String) },
      asientos: expect.any(Array),
    });
  });

  test('200 filtro por estado devuelve solo las que coincidan', async ({ request }) => {
    const res = await request.get('/admin/reservas?estado=pendiente_pago&page=1&limit=50', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const r of body.data) {
      expect(r.estado).toBe('pendiente_pago');
    }
  });
});

// ─── 3. Detalle por ID (admin) ───────────────────────────────────────────────

test.describe('GET /admin/reservas/:id — detalle', () => {
  let seed: ReservaSeed;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    const cliente = await loginAs(request, 'cliente');
    seed = await seedFuncionConReserva(cliente.userId);
  });

  test.afterAll(async () => {
    await cleanupReservaSeed(seed);
  });

  test('200 devuelve detalle completo con cliente y funcion', async ({ request }) => {
    const res = await request.get(`/admin/reservas/${seed.idReserva}`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      id: seed.idReserva,
      numero_reserva: seed.numero,
      estado: 'pendiente_pago',
      cliente: { email: expect.any(String) },
      funcion: {
        pelicula: { titulo: expect.any(String) },
        sala: { nombre: expect.any(String) },
        cine: { nombre: expect.any(String) },
      },
      asientos: expect.any(Array),
    });
  });

  test('404 para ID inexistente', async ({ request }) => {
    const res = await request.get('/admin/reservas/999999999999', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(404);
  });

  test('403 si cliente intenta acceder a detalle admin', async ({ request }) => {
    const cliente = await loginAs(request, 'cliente');
    const res = await request.get(`/admin/reservas/${seed.idReserva}`, {
      headers: authHeaders(cliente.token),
    });
    expect(res.status()).toBe(403);
  });
});

// ─── 4. Cancelar por admin (PATCH) ──────────────────────────────────────────

test.describe('PATCH /admin/reservas/:id/cancelar', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.patch('/admin/reservas/1/cancelar');
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const cliente = await loginAs(request, 'cliente');
    const res = await request.patch('/admin/reservas/1/cancelar', {
      headers: authHeaders(cliente.token),
    });
    expect(res.status()).toBe(403);
  });

  test('cancela reserva pendiente_pago sin crear reembolso', async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    const cliente = await loginAs(request, 'cliente');
    const seed = await seedFuncionConReserva(cliente.userId);

    try {
      const res = await request.patch(`/admin/reservas/${seed.idReserva}/cancelar`, {
        headers: authHeaders(admin.token),
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.reserva.estado).toBe('cancelada');
      expect(body.reserva.numero_reserva).toBe(seed.numero);
      expect(body.reembolso).toBeNull();
    } finally {
      await cleanupReservaSeed(seed).catch(() => {});
    }
  });

  test('cancela reserva pagada y crea reembolso', async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    const cliente = await loginAs(request, 'cliente');
    const seed = await seedFuncionConReserva(cliente.userId, { pagada: true });

    try {
      const res = await request.patch(`/admin/reservas/${seed.idReserva}/cancelar`, {
        headers: authHeaders(admin.token),
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.reserva.estado).toBe('cancelada');
      expect(body.reembolso).not.toBeNull();
      expect(body.reembolso).toMatchObject({
        id: expect.any(String),
        estado: expect.any(String),
        monto: expect.any(String),
      });
    } finally {
      await cleanupReservaSeed(seed).catch(() => {});
    }
  });

  test('409 doble cancelación', async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    const cliente = await loginAs(request, 'cliente');
    const seed = await seedFuncionConReserva(cliente.userId);

    try {
      const first = await request.patch(`/admin/reservas/${seed.idReserva}/cancelar`, {
        headers: authHeaders(admin.token),
      });
      expect(first.status()).toBe(200);

      const second = await request.patch(`/admin/reservas/${seed.idReserva}/cancelar`, {
        headers: authHeaders(admin.token),
      });
      expect(second.status()).toBe(409);
    } finally {
      await cleanupReservaSeed(seed).catch(() => {});
    }
  });

  test('404 para reserva inexistente', async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    const res = await request.patch('/admin/reservas/999999999999/cancelar', {
      headers: authHeaders(admin.token),
    });
    expect(res.status()).toBe(404);
  });
});
