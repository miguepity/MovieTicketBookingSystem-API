import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';

// ─── 1. Auth guard ───────────────────────────────────────────────────────────

test.describe('GET /me/metodos-pago — auth', () => {
  test('401 sin token en /me/metodos-pago', async ({ request }) => {
    const res = await request.get('/me/metodos-pago');
    expect(res.status()).toBe(401);
  });

  test('401 sin token en alias deprecated /usuarios/me/metodos-pago', async ({ request }) => {
    const res = await request.get('/usuarios/me/metodos-pago');
    expect(res.status()).toBe(401);
  });
});

// ─── 2. Alias parity ─────────────────────────────────────────────────────────

test.describe('GET /me/metodos-pago vs alias /usuarios/me/metodos-pago', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    token = auth.token;
  });

  test('200 /me/metodos-pago retorna array', async ({ request }) => {
    const res = await request.get('/me/metodos-pago', {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('200 /usuarios/me/metodos-pago (alias) retorna la misma forma', async ({ request }) => {
    const [resNew, resOld] = await Promise.all([
      request.get('/me/metodos-pago', { headers: authHeaders(token) }),
      request.get('/usuarios/me/metodos-pago', { headers: authHeaders(token) }),
    ]);

    expect(resNew.status()).toBe(200);
    expect(resOld.status()).toBe(200);

    const newBody = await resNew.json();
    const oldBody = await resOld.json();

    // Both should be arrays with the same length
    expect(Array.isArray(newBody)).toBe(true);
    expect(Array.isArray(oldBody)).toBe(true);
    expect(newBody.length).toBe(oldBody.length);
  });
});
