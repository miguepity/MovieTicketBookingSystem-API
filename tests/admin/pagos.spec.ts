import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import {
  seedFuncionConReserva,
  cleanupReservaSeed,
} from '../helpers/seed-funcion';
import type { ReservaSeed } from '../helpers/seed-funcion';

// ─── 1. Autenticación ────────────────────────────────────────────────────────

test.describe('GET /admin/pagos — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.get('/admin/pagos');
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const res = await request.get('/admin/pagos', {
      headers: authHeaders(auth.token),
    });
    expect(res.status()).toBe(403);
  });
});

// ─── 2. Listado paginado (admin) ─────────────────────────────────────────────

test.describe('GET /admin/pagos — lista paginada', () => {
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

    // pagada: true => crea la reserva + pago exitoso
    seed = await seedFuncionConReserva(clienteUserId, { pagada: true });
  });

  test.afterAll(async () => {
    await cleanupReservaSeed(seed);
  });

  test('200 lista paginada con shape { data, total, page, limit }', async ({ request }) => {
    const res = await request.get('/admin/pagos?page=1&limit=10', {
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

  test('200 items contienen cliente, cine y numero_reserva enriquecidos', async ({ request }) => {
    const res = await request.get('/admin/pagos?page=1&limit=50', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();

    // Find the seeded pago by numero_reserva
    const item = body.data.find((p: any) => p.numero_reserva === seed.numero);
    expect(item).toBeDefined();
    expect(item).toMatchObject({
      numero_reserva: seed.numero,
      estado: 'exitoso',
      cliente: {
        email: clienteEmail,
        nombre: expect.any(String),
      },
      cine: { nombre: expect.any(String) },
      metodo: expect.any(String),
      monto_original: expect.any(String),
      monto_descuento: expect.any(String),
      monto_final: expect.any(String),
    });
  });

  test('200 filtro por estado=exitoso devuelve solo pagos exitosos', async ({ request }) => {
    const res = await request.get('/admin/pagos?estado=exitoso&page=1&limit=50', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const p of body.data) {
      expect(p.estado).toBe('exitoso');
    }
  });
});

// ─── 3. Detalle por ID (admin) ───────────────────────────────────────────────

test.describe('GET /admin/pagos/:id — detalle', () => {
  let seed: ReservaSeed;
  let adminToken: string;
  let pagoId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    const cliente = await loginAs(request, 'cliente');
    seed = await seedFuncionConReserva(cliente.userId, { pagada: true });

    // Fetch the pago ID via by-reserva
    const res = await request.get(`/admin/pagos/reserva/${seed.idReserva}`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const arr = await res.json();
    expect(arr.length).toBeGreaterThan(0);
    pagoId = arr[0].id;
  });

  test.afterAll(async () => {
    await cleanupReservaSeed(seed);
  });

  test('200 detalle completo con cliente y cine', async ({ request }) => {
    const res = await request.get(`/admin/pagos/${pagoId}`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      id: pagoId,
      numero_reserva: seed.numero,
      estado: 'exitoso',
      cliente: { email: expect.any(String) },
      cine: { nombre: expect.any(String) },
      monto_final: expect.any(String),
    });
  });

  test('404 para ID inexistente', async ({ request }) => {
    const res = await request.get('/admin/pagos/999999999999', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(404);
  });

  test('403 si cliente intenta acceder a detalle admin', async ({ request }) => {
    const cliente = await loginAs(request, 'cliente');
    const res = await request.get(`/admin/pagos/${pagoId}`, {
      headers: authHeaders(cliente.token),
    });
    expect(res.status()).toBe(403);
  });
});

// ─── 4. Pagos por reserva ─────────────────────────────────────────────────────

test.describe('GET /admin/pagos/reserva/:idReserva', () => {
  let seed: ReservaSeed;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    const cliente = await loginAs(request, 'cliente');
    seed = await seedFuncionConReserva(cliente.userId, { pagada: true });
  });

  test.afterAll(async () => {
    await cleanupReservaSeed(seed);
  });

  test('401 sin token', async ({ request }) => {
    const res = await request.get(`/admin/pagos/reserva/${seed.idReserva}`);
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const cliente = await loginAs(request, 'cliente');
    const res = await request.get(`/admin/pagos/reserva/${seed.idReserva}`, {
      headers: authHeaders(cliente.token),
    });
    expect(res.status()).toBe(403);
  });

  test('200 retorna array con al menos un pago', async ({ request }) => {
    const res = await request.get(`/admin/pagos/reserva/${seed.idReserva}`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toMatchObject({
      numero_reserva: seed.numero,
      estado: 'exitoso',
      cliente: { email: expect.any(String) },
      cine: { nombre: expect.any(String) },
      monto_final: expect.any(String),
    });
  });

  test('404 para reserva inexistente', async ({ request }) => {
    const res = await request.get('/admin/pagos/reserva/999999999999', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(404);
  });
});
