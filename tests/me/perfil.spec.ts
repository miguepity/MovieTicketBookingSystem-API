import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';

// ─── 1. Auth guard ───────────────────────────────────────────────────────────

test.describe('GET /me/perfil — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.get('/me/perfil');
    expect(res.status()).toBe(401);
  });

  test('401 sin token para PATCH', async ({ request }) => {
    const res = await request.patch('/me/perfil', { data: {} });
    expect(res.status()).toBe(401);
  });
});

// ─── 2. GET /me/perfil ───────────────────────────────────────────────────────

test.describe('GET /me/perfil — obtener perfil', () => {
  let token: string;
  let userId: string;
  let email: string;

  test.beforeAll(async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    token = auth.token;
    userId = auth.userId;
    email = auth.email;
  });

  test('200 retorna perfil del usuario autenticado', async ({ request }) => {
    const res = await request.get('/me/perfil', {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      id: userId,
      email,
      nombre: expect.any(String),
      notificaciones_activas: expect.any(Boolean),
    });
  });
});

// ─── 3. PATCH /me/perfil ─────────────────────────────────────────────────────

test.describe('PATCH /me/perfil — actualizar perfil', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    token = auth.token;
  });

  test('200 actualiza nombre y teléfono', async ({ request }) => {
    const nuevoNombre = `Test User ${Date.now()}`;
    const res = await request.patch('/me/perfil', {
      headers: authHeaders(token),
      data: { nombre: nuevoNombre, telefono: '+502 9999 0000' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      nombre: nuevoNombre,
      telefono: '+502 9999 0000',
    });
  });

  test('200 actualiza notificaciones_activas', async ({ request }) => {
    // Get current value first
    const profile = await request.get('/me/perfil', { headers: authHeaders(token) });
    const current = (await profile.json()).notificaciones_activas as boolean;

    const res = await request.patch('/me/perfil', {
      headers: authHeaders(token),
      data: { notificaciones_activas: !current },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.notificaciones_activas).toBe(!current);
  });
});
