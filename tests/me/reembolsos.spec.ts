import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import {
  seedFuncionConReserva,
  cleanupReservaSeed,
} from '../helpers/seed-funcion';
import type { ReservaSeed } from '../helpers/seed-funcion';

// ─── 1. Autenticación ────────────────────────────────────────────────────────

test.describe('GET /me/reembolsos — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.get('/me/reembolsos');
    expect(res.status()).toBe(401);
  });
});

// ─── 2. Listado con shape MiReembolso ────────────────────────────────────────

test.describe('GET /me/reembolsos — lista con reembolso', () => {
  let seed: ReservaSeed;
  let token: string;
  let userId: string;

  test.beforeAll(async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    token = auth.token;
    userId = auth.userId;

    // Seed a paid reservation
    seed = await seedFuncionConReserva(userId, { pagada: true });

    // Cancel it via the existing flow — this triggers reembolso creation
    const res = await request.patch(`/me/reservas/${seed.numero}/cancelar`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.reembolso).not.toBeNull();
  });

  test.afterAll(async () => {
    await cleanupReservaSeed(seed);
  });

  test('200 lista mis reembolsos con shape correcto', async ({ request }) => {
    const res = await request.get('/me/reembolsos', {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);

    // Find the reembolso for the seeded reserva
    const reembolso = body.find((r: any) => r.numero_reserva === seed.numero);
    expect(reembolso).toBeDefined();

    // Assert shape
    expect(reembolso).toMatchObject({
      id: expect.any(String),
      numero_reserva: seed.numero,
      monto: expect.any(String),
      estado: expect.any(String),
      porcentaje_aplicado: expect.any(String),
    });
    expect(Number(reembolso.monto)).toBeGreaterThanOrEqual(0);
    expect(['pendiente', 'procesado', 'rechazado']).toContain(reembolso.estado);
    // motivo_rechazo is null (field not in current schema)
    expect(reembolso.motivo_rechazo).toBeNull();
  });
});

// ─── 3. Aislamiento por usuario ──────────────────────────────────────────────

test.describe('GET /me/reembolsos — aislamiento por usuario', () => {
  let clienteSeed: ReservaSeed;
  let clienteToken: string;
  let clienteUserId: string;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const clienteAuth = await loginAs(request, 'cliente');
    clienteToken = clienteAuth.token;
    clienteUserId = clienteAuth.userId;

    const adminAuth = await loginAs(request, 'admin');
    adminToken = adminAuth.token;

    // Seed a paid reserva for cliente and cancel it to create a reembolso
    clienteSeed = await seedFuncionConReserva(clienteUserId, { pagada: true });
    const cancelRes = await request.patch(
      `/me/reservas/${clienteSeed.numero}/cancelar`,
      { headers: authHeaders(clienteToken) },
    );
    expect(cancelRes.status()).toBe(200);
  });

  test.afterAll(async () => {
    await cleanupReservaSeed(clienteSeed);
  });

  test('admin no ve los reembolsos del cliente en su /me/reembolsos', async ({ request }) => {
    const res = await request.get('/me/reembolsos', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);

    // The cliente's reembolso must NOT appear in admin's list
    const leaked = body.find((r: any) => r.numero_reserva === clienteSeed.numero);
    expect(leaked).toBeUndefined();
  });

  test('cliente solo ve sus propios reembolsos', async ({ request }) => {
    const res = await request.get('/me/reembolsos', {
      headers: authHeaders(clienteToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);

    const found = body.find((r: any) => r.numero_reserva === clienteSeed.numero);
    expect(found).toBeDefined();
  });
});
