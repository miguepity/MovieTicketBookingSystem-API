import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';

// ─── 1. Auth guards ───────────────────────────────────────────────────────────

test.describe('GET /admin/staff — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.get('/admin/staff');
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const res = await request.get('/admin/staff', {
      headers: authHeaders(auth.token),
    });
    expect(res.status()).toBe(403);
  });
});

// ─── 2. Listado paginado ──────────────────────────────────────────────────────

test.describe('GET /admin/staff — lista paginada', () => {
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
  });

  test('200 lista paginada con shape { data, total, page, limit }', async ({ request }) => {
    const res = await request.get('/admin/staff?page=1&limit=10', {
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
    const item = body.data[0];
    expect(item).toMatchObject({
      id: expect.any(String),
      nombre: expect.any(String),
      email: expect.any(String),
      estado: expect.any(String),
      created_at: expect.any(String),
    });
  });
});

// ─── 3. POST — crear staff ────────────────────────────────────────────────────

test.describe('POST /admin/staff', () => {
  let adminToken: string;
  const uniqueSuffix = Date.now();

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
  });

  test('POST sin password → respuesta tiene tempPassword', async ({ request }) => {
    const res = await request.post('/admin/staff', {
      headers: authHeaders(adminToken),
      data: {
        nombre: `Staff Sin Pass ${uniqueSuffix}`,
        email: `staff-nopass-${uniqueSuffix}@test.com`,
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      user: {
        id: expect.any(String),
        nombre: expect.any(String),
        email: expect.any(String),
        estado: 'activo',
        created_at: expect.any(String),
      },
      tempPassword: expect.any(String),
    });
    expect(body.tempPassword.length).toBeGreaterThan(0);
  });

  test('POST con password → no tempPassword en respuesta', async ({ request }) => {
    const res = await request.post('/admin/staff', {
      headers: authHeaders(adminToken),
      data: {
        nombre: `Staff Con Pass ${uniqueSuffix}`,
        email: `staff-withpass-${uniqueSuffix}@test.com`,
        password: 'superSecret1',
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      user: {
        id: expect.any(String),
        email: expect.any(String),
        estado: 'activo',
      },
    });
    expect(body.tempPassword).toBeUndefined();
  });

  test('POST email duplicado → 409', async ({ request }) => {
    const email = `staff-dup-${uniqueSuffix}@test.com`;

    // First creation
    await request.post('/admin/staff', {
      headers: authHeaders(adminToken),
      data: { nombre: 'Staff Dup A', email },
    });

    // Duplicate
    const res = await request.post('/admin/staff', {
      headers: authHeaders(adminToken),
      data: { nombre: 'Staff Dup B', email },
    });
    expect(res.status()).toBe(409);
  });
});

// ─── 4. PATCH :id/estado ─────────────────────────────────────────────────────

test.describe('PATCH /admin/staff/:id/estado', () => {
  let adminToken: string;
  let staffId: string;
  const uniqueSuffix = Date.now() + 100;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    // Create a staff user to toggle
    const res = await request.post('/admin/staff', {
      headers: authHeaders(adminToken),
      data: {
        nombre: `Staff Estado ${uniqueSuffix}`,
        email: `staff-estado-${uniqueSuffix}@test.com`,
      },
    });
    const body = await res.json();
    staffId = body.user.id;
  });

  test('PATCH :id/estado cambia estado a bloqueado', async ({ request }) => {
    const res = await request.patch(`/admin/staff/${staffId}/estado`, {
      headers: authHeaders(adminToken),
      data: { estado: 'bloqueado' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.estado).toBe('bloqueado');
  });

  test('PATCH :id/estado cambia estado a activo', async ({ request }) => {
    const res = await request.patch(`/admin/staff/${staffId}/estado`, {
      headers: authHeaders(adminToken),
      data: { estado: 'activo' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.estado).toBe('activo');
  });
});

// ─── 5. POST :id/reset-password ──────────────────────────────────────────────

test.describe('POST /admin/staff/:id/reset-password', () => {
  let adminToken: string;
  let staffId: string;
  const uniqueSuffix = Date.now() + 200;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    const res = await request.post('/admin/staff', {
      headers: authHeaders(adminToken),
      data: {
        nombre: `Staff Reset ${uniqueSuffix}`,
        email: `staff-reset-${uniqueSuffix}@test.com`,
        password: 'initialPass99',
      },
    });
    const body = await res.json();
    staffId = body.user.id;
  });

  test('POST :id/reset-password → retorna tempPassword string', async ({ request }) => {
    const res = await request.post(`/admin/staff/${staffId}/reset-password`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      tempPassword: expect.any(String),
    });
    expect(body.tempPassword.length).toBeGreaterThan(0);
  });
});
