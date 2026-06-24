import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';

// ─── 1. Autenticación ────────────────────────────────────────────────────────

test.describe('GET /admin/clientes — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.get('/admin/clientes');
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const res = await request.get('/admin/clientes', {
      headers: authHeaders(auth.token),
    });
    expect(res.status()).toBe(403);
  });
});

// ─── 2. Listado paginado (admin) ─────────────────────────────────────────────

test.describe('GET /admin/clientes — lista paginada', () => {
  let adminToken: string;
  let clienteUserId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    const cliente = await loginAs(request, 'cliente');
    clienteUserId = cliente.userId;
  });

  test('200 lista paginada con shape { data, total, page, limit }', async ({ request }) => {
    const res = await request.get('/admin/clientes?page=1&limit=10', {
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

  test('200 items contienen los campos requeridos', async ({ request }) => {
    const res = await request.get('/admin/clientes?page=1&limit=50', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();

    const item = body.data.find((c: any) => c.id === clienteUserId);
    expect(item).toBeDefined();
    expect(item).toMatchObject({
      id: expect.any(String),
      nombre: expect.any(String),
      email: expect.any(String),
      estado: expect.any(String),
      notificaciones_activas: expect.any(Boolean),
      num_reservas: expect.any(Number),
      created_at: expect.any(String),
    });
  });

  test('200 filtro por estado devuelve solo los que coincidan', async ({ request }) => {
    const res = await request.get('/admin/clientes?estado=activo&page=1&limit=50', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const c of body.data) {
      expect(c.estado).toBe('activo');
    }
  });

  test('200 filtro por q devuelve coincidencias', async ({ request }) => {
    const res = await request.get('/admin/clientes?q=cliente&page=1&limit=20', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      page: 1,
      limit: 20,
      total: expect.any(Number),
      data: expect.any(Array),
    });
  });
});

// ─── 3. Detalle por ID (admin) ───────────────────────────────────────────────

test.describe('GET /admin/clientes/:id — detalle', () => {
  let adminToken: string;
  let clienteUserId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    const cliente = await loginAs(request, 'cliente');
    clienteUserId = cliente.userId;
  });

  test('200 devuelve detalle con campo reservas', async ({ request }) => {
    const res = await request.get(`/admin/clientes/${clienteUserId}`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      id: clienteUserId,
      nombre: expect.any(String),
      email: expect.any(String),
      estado: expect.any(String),
      notificaciones_activas: expect.any(Boolean),
      num_reservas: expect.any(Number),
      created_at: expect.any(String),
      reservas: expect.any(Array),
    });
  });

  test('404 para ID inexistente', async ({ request }) => {
    const res = await request.get('/admin/clientes/999999999999', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(404);
  });

  test('403 si cliente intenta acceder a detalle admin', async ({ request }) => {
    const cliente = await loginAs(request, 'cliente');
    const res = await request.get(`/admin/clientes/${clienteUserId}`, {
      headers: authHeaders(cliente.token),
    });
    expect(res.status()).toBe(403);
  });
});

// ─── 4. PATCH estado ─────────────────────────────────────────────────────────

test.describe('PATCH /admin/clientes/:id/estado', () => {
  let adminToken: string;
  let clienteUserId: string;
  let clienteEstadoInicial: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    const cliente = await loginAs(request, 'cliente');
    clienteUserId = cliente.userId;

    // Get initial estado
    const res = await request.get(`/admin/clientes/${clienteUserId}`, {
      headers: authHeaders(adminToken),
    });
    const body = await res.json();
    clienteEstadoInicial = body.estado;
  });

  test.afterAll(async ({ request }) => {
    // Restore original estado
    if (clienteEstadoInicial) {
      await request.patch(`/admin/clientes/${clienteUserId}/estado`, {
        headers: authHeaders(adminToken),
        data: { estado: clienteEstadoInicial },
      });
    }
  });

  test('401 sin token', async ({ request }) => {
    const res = await request.patch(`/admin/clientes/${clienteUserId}/estado`, {
      data: { estado: 'bloqueado' },
    });
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const cliente = await loginAs(request, 'cliente');
    const res = await request.patch(`/admin/clientes/${clienteUserId}/estado`, {
      headers: authHeaders(cliente.token),
      data: { estado: 'bloqueado' },
    });
    expect(res.status()).toBe(403);
  });

  test('400 si estado inválido', async ({ request }) => {
    const res = await request.patch(`/admin/clientes/${clienteUserId}/estado`, {
      headers: authHeaders(adminToken),
      data: { estado: 'suspendido' },
    });
    expect(res.status()).toBe(400);
  });

  test('PATCH cambia estado y retorna cliente actualizado', async ({ request }) => {
    const nuevoEstado = clienteEstadoInicial === 'activo' ? 'bloqueado' : 'activo';

    const res = await request.patch(`/admin/clientes/${clienteUserId}/estado`, {
      headers: authHeaders(adminToken),
      data: { estado: nuevoEstado },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      id: clienteUserId,
      nombre: expect.any(String),
      email: expect.any(String),
      estado: nuevoEstado,
      notificaciones_activas: expect.any(Boolean),
      num_reservas: expect.any(Number),
      created_at: expect.any(String),
    });
  });
});
