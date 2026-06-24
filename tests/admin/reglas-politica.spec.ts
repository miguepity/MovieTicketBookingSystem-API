import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function makePrisma() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getTestCineId(): Promise<string> {
  const p = makePrisma();
  try {
    const cine = await p.cines.findFirst({ select: { id: true } });
    if (!cine) throw new Error('No cines found in DB');
    return cine.id.toString();
  } finally {
    await p.$disconnect();
  }
}

async function createTestPolitica(
  idCine: string,
  nombre: string,
  activa = false,
): Promise<string> {
  const p = makePrisma();
  try {
    const politica = await p.politicaCancelacion.create({
      data: { id_cine: BigInt(idCine), nombre, activa },
    });
    return politica.id.toString();
  } finally {
    await p.$disconnect();
  }
}

async function cleanupPolitica(id: string): Promise<void> {
  const p = makePrisma();
  try {
    await p.reglaPoliticaCancelacion.deleteMany({
      where: { id_politica: BigInt(id) },
    });
    await p.politicaCancelacion.deleteMany({ where: { id: BigInt(id) } });
  } finally {
    await p.$disconnect();
  }
}

// ─── 1. Auth guards ───────────────────────────────────────────────────────────

test.describe('GET /admin/politicas-cancelacion/cine/:id — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.get('/admin/politicas-cancelacion/cine/1');
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const res = await request.get('/admin/politicas-cancelacion/cine/1', {
      headers: authHeaders(auth.token),
    });
    expect(res.status()).toBe(403);
  });
});

test.describe('GET /admin/politicas-cancelacion/:id/reglas — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.get('/admin/politicas-cancelacion/1/reglas');
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const res = await request.get('/admin/politicas-cancelacion/1/reglas', {
      headers: authHeaders(auth.token),
    });
    expect(res.status()).toBe(403);
  });
});

test.describe('PATCH /admin/politicas-cancelacion/:id/reglas — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.patch('/admin/politicas-cancelacion/1/reglas', {
      data: { reglas: [] },
    });
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const res = await request.patch('/admin/politicas-cancelacion/1/reglas', {
      headers: authHeaders(auth.token),
      data: { reglas: [] },
    });
    expect(res.status()).toBe(403);
  });
});

test.describe('PATCH /admin/politicas-cancelacion/:id/activa — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.patch('/admin/politicas-cancelacion/1/activa', {
      data: { activa: true },
    });
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const res = await request.patch('/admin/politicas-cancelacion/1/activa', {
      headers: authHeaders(auth.token),
      data: { activa: true },
    });
    expect(res.status()).toBe(403);
  });
});

// ─── 2. listByCine ───────────────────────────────────────────────────────────

test.describe('GET /admin/politicas-cancelacion/cine/:idCine — listByCine', () => {
  let adminToken: string;
  let cineId: string;
  let politicaId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
    cineId = await getTestCineId();
    politicaId = await createTestPolitica(cineId, `Test listByCine ${Date.now()}`);
  });

  test.afterAll(async () => {
    if (politicaId) await cleanupPolitica(politicaId);
  });

  test('200 retorna array de políticas', async ({ request }) => {
    const res = await request.get(
      `/admin/politicas-cancelacion/cine/${cineId}`,
      { headers: authHeaders(adminToken) },
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('200 items tienen campos id, nombre, activa, id_cine', async ({ request }) => {
    const res = await request.get(
      `/admin/politicas-cancelacion/cine/${cineId}`,
      { headers: authHeaders(adminToken) },
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    const item = body.find((p: any) => p.id === politicaId);
    expect(item).toBeDefined();
    expect(item).toMatchObject({
      id: expect.any(String),
      nombre: expect.any(String),
      activa: expect.any(Boolean),
      id_cine: cineId,
    });
  });
});

// ─── 3. listReglas ───────────────────────────────────────────────────────────

test.describe('GET /admin/politicas-cancelacion/:id/reglas — listReglas', () => {
  let adminToken: string;
  let cineId: string;
  let politicaId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
    cineId = await getTestCineId();
    politicaId = await createTestPolitica(cineId, `Test listReglas ${Date.now()}`);
  });

  test.afterAll(async () => {
    if (politicaId) await cleanupPolitica(politicaId);
  });

  test('200 retorna array (vacío si no hay reglas)', async ({ request }) => {
    const res = await request.get(
      `/admin/politicas-cancelacion/${politicaId}/reglas`,
      { headers: authHeaders(adminToken) },
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

// ─── 4. replaceReglas ────────────────────────────────────────────────────────

test.describe('PATCH /admin/politicas-cancelacion/:id/reglas — replaceReglas', () => {
  let adminToken: string;
  let cineId: string;
  let politicaId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
    cineId = await getTestCineId();
    politicaId = await createTestPolitica(cineId, `Test replaceReglas ${Date.now()}`);
  });

  test.afterAll(async () => {
    if (politicaId) await cleanupPolitica(politicaId);
  });

  test('200 happy path — reemplaza reglas atómicamente', async ({ request }) => {
    const reglas = [
      { horas_antes_minimo: 0, horas_antes_maximo: 2, porcentaje_reembolso: 0 },
      { horas_antes_minimo: 2, horas_antes_maximo: 24, porcentaje_reembolso: 50 },
      { horas_antes_minimo: 24, horas_antes_maximo: 72, porcentaje_reembolso: 90 },
    ];

    const res = await request.patch(
      `/admin/politicas-cancelacion/${politicaId}/reglas`,
      { headers: authHeaders(adminToken), data: { reglas } },
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(3);
    // Should be sorted by horas_antes_minimo ascending
    expect(body[0].horas_antes_minimo).toBe(0);
    expect(body[1].horas_antes_minimo).toBe(2);
    expect(body[2].horas_antes_minimo).toBe(24);
  });

  test('200 lista reglas tras replace coincide con lo enviado', async ({ request }) => {
    const reglas = [
      { horas_antes_minimo: 1, horas_antes_maximo: 5, porcentaje_reembolso: 25 },
    ];
    await request.patch(`/admin/politicas-cancelacion/${politicaId}/reglas`, {
      headers: authHeaders(adminToken),
      data: { reglas },
    });

    const listRes = await request.get(
      `/admin/politicas-cancelacion/${politicaId}/reglas`,
      { headers: authHeaders(adminToken) },
    );
    expect(listRes.status()).toBe(200);
    const list = await listRes.json();
    expect(list.length).toBe(1);
    expect(list[0]).toMatchObject({
      horas_antes_minimo: 1,
      horas_antes_maximo: 5,
    });
  });

  test('400 si horas_antes_minimo >= horas_antes_maximo', async ({ request }) => {
    const reglas = [
      { horas_antes_minimo: 10, horas_antes_maximo: 10, porcentaje_reembolso: 50 },
    ];
    const res = await request.patch(
      `/admin/politicas-cancelacion/${politicaId}/reglas`,
      { headers: authHeaders(adminToken), data: { reglas } },
    );
    expect(res.status()).toBe(400);
  });

  test('400 si horas_antes_minimo > horas_antes_maximo', async ({ request }) => {
    const reglas = [
      { horas_antes_minimo: 24, horas_antes_maximo: 12, porcentaje_reembolso: 50 },
    ];
    const res = await request.patch(
      `/admin/politicas-cancelacion/${politicaId}/reglas`,
      { headers: authHeaders(adminToken), data: { reglas } },
    );
    expect(res.status()).toBe(400);
  });

  test('400 si reglas se solapan', async ({ request }) => {
    // Rule 1 max=10 > Rule 2 min=8 → overlap
    const reglas = [
      { horas_antes_minimo: 0, horas_antes_maximo: 10, porcentaje_reembolso: 0 },
      { horas_antes_minimo: 8, horas_antes_maximo: 20, porcentaje_reembolso: 50 },
    ];
    const res = await request.patch(
      `/admin/politicas-cancelacion/${politicaId}/reglas`,
      { headers: authHeaders(adminToken), data: { reglas } },
    );
    expect(res.status()).toBe(400);
  });

  test('200 reglas vacías — borra todas', async ({ request }) => {
    const res = await request.patch(
      `/admin/politicas-cancelacion/${politicaId}/reglas`,
      { headers: authHeaders(adminToken), data: { reglas: [] } },
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(0);
  });
});

// ─── 5. setActiva ────────────────────────────────────────────────────────────

test.describe('PATCH /admin/politicas-cancelacion/:id/activa — setActiva', () => {
  let adminToken: string;
  let cineId: string;
  let politica1Id: string;
  let politica2Id: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
    cineId = await getTestCineId();

    const suffix = Date.now();
    politica1Id = await createTestPolitica(cineId, `Test activa A ${suffix}`, false);
    politica2Id = await createTestPolitica(cineId, `Test activa B ${suffix}`, false);
  });

  test.afterAll(async () => {
    if (politica1Id) await cleanupPolitica(politica1Id);
    if (politica2Id) await cleanupPolitica(politica2Id);
  });

  test('200 activar politica1 → politica1.activa = true', async ({ request }) => {
    const res = await request.patch(
      `/admin/politicas-cancelacion/${politica1Id}/activa`,
      { headers: authHeaders(adminToken), data: { activa: true } },
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.activa).toBe(true);
  });

  test('200 activar politica2 → politica1.activa se vuelve false', async ({ request }) => {
    // First, ensure politica1 is active
    await request.patch(
      `/admin/politicas-cancelacion/${politica1Id}/activa`,
      { headers: authHeaders(adminToken), data: { activa: true } },
    );

    // Now activate politica2 → should deactivate politica1
    const res = await request.patch(
      `/admin/politicas-cancelacion/${politica2Id}/activa`,
      { headers: authHeaders(adminToken), data: { activa: true } },
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.activa).toBe(true);

    // Verify politica1 is now inactive via listByCine
    const listRes = await request.get(
      `/admin/politicas-cancelacion/cine/${cineId}`,
      { headers: authHeaders(adminToken) },
    );
    const list = await listRes.json();
    const p1 = list.find((p: any) => p.id === politica1Id);
    expect(p1?.activa).toBe(false);
  });

  test('200 desactivar sin afectar otras', async ({ request }) => {
    const res = await request.patch(
      `/admin/politicas-cancelacion/${politica2Id}/activa`,
      { headers: authHeaders(adminToken), data: { activa: false } },
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.activa).toBe(false);
  });

  test('404 si política no existe', async ({ request }) => {
    const res = await request.patch(
      '/admin/politicas-cancelacion/999999999/activa',
      { headers: authHeaders(adminToken), data: { activa: true } },
    );
    expect(res.status()).toBe(404);
  });
});
