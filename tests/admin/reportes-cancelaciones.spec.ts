import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import {
  seedFuncionConReserva,
  cleanupReservaSeed,
} from '../helpers/seed-funcion';
import type { ReservaSeed } from '../helpers/seed-funcion';

// ─── 1. Auth & roles ─────────────────────────────────────────────────────────

test.describe('GET /admin/reportes/cancelaciones — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.get('/admin/reportes/cancelaciones');
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const res = await request.get('/admin/reportes/cancelaciones', {
      headers: authHeaders(auth.token),
    });
    expect(res.status()).toBe(403);
  });
});

// ─── 2. Shape básica ─────────────────────────────────────────────────────────

test.describe('GET /admin/reportes/cancelaciones — shape', () => {
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const auth = await loginAs(request, 'admin');
    adminToken = auth.token;
  });

  test('200 retorna shape { total_canceladas, tasa, por_politica, por_cine, tendencia_30d }', async ({ request }) => {
    const res = await request.get('/admin/reportes/cancelaciones', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      total_canceladas: expect.any(Number),
      tasa: expect.any(Number),
      por_politica: expect.any(Array),
      por_cine: expect.any(Array),
      tendencia_30d: expect.any(Array),
    });
  });

  test('200 tasa está entre 0 y 1', async ({ request }) => {
    const res = await request.get('/admin/reportes/cancelaciones', {
      headers: authHeaders(adminToken),
    });
    const body = await res.json();
    expect(body.tasa).toBeGreaterThanOrEqual(0);
    expect(body.tasa).toBeLessThanOrEqual(1);
  });

  test('200 por_cine items tienen shape { nombre, count }', async ({ request }) => {
    const res = await request.get('/admin/reportes/cancelaciones', {
      headers: authHeaders(adminToken),
    });
    const body = await res.json();
    for (const item of body.por_cine) {
      expect(item).toMatchObject({
        nombre: expect.any(String),
        count: expect.any(Number),
      });
    }
  });

  test('200 por_politica items tienen shape { nombre, count }', async ({ request }) => {
    const res = await request.get('/admin/reportes/cancelaciones', {
      headers: authHeaders(adminToken),
    });
    const body = await res.json();
    for (const item of body.por_politica) {
      expect(item).toMatchObject({
        nombre: expect.any(String),
        count: expect.any(Number),
      });
    }
  });

  test('200 tendencia_30d items tienen shape { fecha, count }', async ({ request }) => {
    const res = await request.get('/admin/reportes/cancelaciones', {
      headers: authHeaders(adminToken),
    });
    const body = await res.json();
    for (const item of body.tendencia_30d) {
      expect(item).toMatchObject({
        fecha: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        count: expect.any(Number),
      });
    }
  });
});

// ─── 3. Con seed de cancelación ───────────────────────────────────────────────

test.describe('GET /admin/reportes/cancelaciones — con seed', () => {
  let adminToken: string;
  let clienteToken: string;
  let clienteId: string;
  let seed: ReservaSeed;

  test.beforeAll(async ({ request }) => {
    const [admin, cliente] = await Promise.all([
      loginAs(request, 'admin'),
      loginAs(request, 'cliente'),
    ]);
    adminToken = admin.token;
    clienteToken = cliente.token;
    clienteId = cliente.userId;

    // Create and cancel a reserva to have at least one cancelada
    seed = await seedFuncionConReserva(clienteId);
    await request.patch(`/me/reservas/${seed.numero}/cancelar`, {
      headers: authHeaders(clienteToken),
    });
  });

  test.afterAll(async () => {
    await cleanupReservaSeed(seed).catch(() => {});
  });

  test('total_canceladas > 0 con al menos una cancelada seedeada', async ({ request }) => {
    const res = await request.get('/admin/reportes/cancelaciones', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.total_canceladas).toBeGreaterThan(0);
  });

  test('filtra por fecha_desde y fecha_hasta', async ({ request }) => {
    const hoy = new Date().toISOString().slice(0, 10);
    // Use tomorrow as fecha_hasta so UTC midnight boundary doesn't exclude today's records
    const manana = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    const res = await request.get(
      `/admin/reportes/cancelaciones?fecha_desde=${hoy}&fecha_hasta=${manana}`,
      { headers: authHeaders(adminToken) },
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      total_canceladas: expect.any(Number),
      tasa: expect.any(Number),
    });
    // The seeded cancelada happened today (or early tomorrow UTC), should appear
    expect(body.total_canceladas).toBeGreaterThan(0);
  });
});
