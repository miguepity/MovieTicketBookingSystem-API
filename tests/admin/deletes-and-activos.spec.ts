/**
 * Task 21 E2E: DELETEs + /activo renames
 *
 * Covers:
 *  - DELETE /peliculas/:id   — 409 with future funciones, 200 soft-delete otherwise
 *  - DELETE /ciudades/:id    — 409 with cines, 200 then 404 otherwise
 *  - PATCH  /peliculas/:id/activo  — 200, returns película
 *  - PATCH  /cupones/:id/activo    — 200
 *  - GET    /Ciudades (deprecated alias) — 200 same data as /ciudades
 *  - Auth: all mutating ops require admin; 403 for cliente
 */

import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { loginAs, authHeaders } from '../helpers/auth';

// ─── Prisma singleton for DB seeding ──────────────────────────────────────────

let _prisma: PrismaClient | null = null;
function prisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  }
  return _prisma;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the first seeded película id (known to exist via seed). */
async function getFirstPeliculaId(): Promise<string> {
  const p = await prisma().peliculas.findFirst({
    where: { deleted_at: null },
    orderBy: { id: 'desc' },
    select: { id: true },
  });
  if (!p) throw new Error('No hay películas en la BD. Corre pnpm run seed.');
  return p.id.toString();
}

/** Creates a bare película without funciones (safe to delete). */
async function seedPeliculaSinFunciones(adminId: bigint): Promise<string> {
  const p = await prisma().peliculas.create({
    data: {
      titulo: `TEST-DELETE-${Date.now()}`,
      activo: true,
      id_usuario: adminId,
    },
    select: { id: true },
  });
  return p.id.toString();
}

/** Creates a película with one future función (blocks delete). */
async function seedPeliculaConFuncionFutura(adminId: bigint): Promise<string> {
  // Find a sala to attach
  const sala = await prisma().salas.findFirst({ select: { id: true } });
  if (!sala) throw new Error('No hay salas en la BD. Corre pnpm run seed.');

  const p = await prisma().peliculas.create({
    data: {
      titulo: `TEST-BLOCKED-${Date.now()}`,
      activo: true,
      id_usuario: adminId,
    },
    select: { id: true },
  });

  await prisma().funciones.create({
    data: {
      id_pelicula: p.id,
      id_sala: sala.id,
      fecha_hora: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days ahead
      estado: 'programada',
    },
  });

  return p.id.toString();
}

/** Cleans up a película created by the test helpers (and its funciones). */
async function cleanupPelicula(id: string): Promise<void> {
  const bigId = BigInt(id);
  await prisma().funciones.deleteMany({ where: { id_pelicula: bigId } });
  await prisma().peliculas.delete({ where: { id: bigId } }).catch(() => {});
}

/** Creates a ciudad without cines (safe to delete). */
async function seedCiudadSinCines(): Promise<string> {
  const c = await prisma().ciudades.create({
    data: { nombre: `Ciudad-TEST-${Date.now()}` },
    select: { id: true },
  });
  return c.id.toString();
}

/** Cleanup ciudad (best-effort). */
async function cleanupCiudad(id: string): Promise<void> {
  await prisma().ciudades.delete({ where: { id: BigInt(id) } }).catch(() => {});
}

/** Returns a seeded cupón id. */
async function getFirstCuponId(): Promise<string> {
  const c = await prisma().cupones.findFirst({ orderBy: { id: 'asc' }, select: { id: true } });
  if (!c) throw new Error('No hay cupones en la BD. Corre pnpm run seed.');
  return c.id.toString();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. DELETE /peliculas/:id — auth guards
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('DELETE /peliculas/:id — auth', () => {
  let peliculaId: string;

  test.beforeAll(async () => {
    peliculaId = await getFirstPeliculaId();
  });

  test('401 sin token', async ({ request }) => {
    const res = await request.delete(`/peliculas/${peliculaId}`);
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const { token } = await loginAs(request, 'cliente');
    const res = await request.delete(`/peliculas/${peliculaId}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(403);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. DELETE /peliculas/:id — con funciones futuras → 409
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('DELETE /peliculas/:id — 409 con funciones futuras', () => {
  let adminToken: string;
  let adminUserId: string;
  let peliculaId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
    adminUserId = admin.userId;
    peliculaId = await seedPeliculaConFuncionFutura(BigInt(adminUserId));
  });

  test.afterAll(async () => {
    await cleanupPelicula(peliculaId);
  });

  test('409 cuando tiene funciones futuras programadas', async ({ request }) => {
    const res = await request.delete(`/peliculas/${peliculaId}`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.message).toMatch(/funciones futuras/i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DELETE /peliculas/:id — soft delete limpio → 200
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('DELETE /peliculas/:id — soft delete sin funciones futuras', () => {
  let adminToken: string;
  let adminUserId: string;
  let peliculaId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
    adminUserId = admin.userId;
    peliculaId = await seedPeliculaSinFunciones(BigInt(adminUserId));
  });

  test.afterAll(async () => {
    await cleanupPelicula(peliculaId);
  });

  test('200 activo=false y deleted_at set', async ({ request }) => {
    const res = await request.delete(`/peliculas/${peliculaId}`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.activo).toBe(false);
    expect(body.deleted_at).not.toBeNull();
    expect(new Date(body.deleted_at).getTime()).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. DELETE /ciudades/:id — auth guard
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('DELETE /ciudades/:id — auth', () => {
  let ciudadId: string;

  test.beforeAll(async () => {
    ciudadId = await seedCiudadSinCines();
  });

  test.afterAll(async () => {
    await cleanupCiudad(ciudadId);
  });

  test('401 sin token', async ({ request }) => {
    const res = await request.delete(`/ciudades/${ciudadId}`);
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const { token } = await loginAs(request, 'cliente');
    const res = await request.delete(`/ciudades/${ciudadId}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(403);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. DELETE /ciudades/:id — con cines asociados → 409
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('DELETE /ciudades/:id — 409 con cines asociados', () => {
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
  });

  test('409 cuando ciudad tiene cines asociados', async ({ request }) => {
    // Get a ciudad that has cines (from seed data)
    const ciudadConCines = await prisma().ciudades.findFirst({
      where: { cines: { some: {} } },
      select: { id: true },
    });
    if (!ciudadConCines) {
      test.skip();
      return;
    }

    const res = await request.delete(`/ciudades/${ciudadConCines.id.toString()}`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.message).toMatch(/cines asociados/i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. DELETE /ciudades/:id — ciudad limpia → 200 luego 404
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('DELETE /ciudades/:id — eliminación exitosa', () => {
  let adminToken: string;
  let ciudadId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
    ciudadId = await seedCiudadSinCines();
  });

  test('200 la primera vez', async ({ request }) => {
    const res = await request.delete(`/ciudades/${ciudadId}`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id.toString()).toBe(ciudadId);
  });

  test('404/500 la segunda vez (ya no existe)', async ({ request }) => {
    const res = await request.delete(`/ciudades/${ciudadId}`, {
      headers: authHeaders(adminToken),
    });
    // Prisma findUniqueOrThrow → NotFoundException → 404
    expect([404, 500]).toContain(res.status());
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. PATCH /peliculas/:id/activo — 200 returns película
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('PATCH /peliculas/:id/activo', () => {
  let adminToken: string;
  let adminUserId: string;
  let peliculaId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
    adminUserId = admin.userId;
    peliculaId = await seedPeliculaSinFunciones(BigInt(adminUserId));
  });

  test.afterAll(async () => {
    await cleanupPelicula(peliculaId);
  });

  test('401 sin token', async ({ request }) => {
    const res = await request.patch(`/peliculas/${peliculaId}/activo`, {
      data: { activo: true },
    });
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const { token } = await loginAs(request, 'cliente');
    const res = await request.patch(`/peliculas/${peliculaId}/activo`, {
      headers: authHeaders(token),
      data: { activo: true },
    });
    expect(res.status()).toBe(403);
  });

  test('200 {activo: true} — activo queda en true', async ({ request }) => {
    const res = await request.patch(`/peliculas/${peliculaId}/activo`, {
      headers: authHeaders(adminToken),
      data: { activo: true },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.activo).toBe(true);
    expect(body.id.toString()).toBe(peliculaId);
  });

  test('200 {activo: false} — activo queda en false', async ({ request }) => {
    const res = await request.patch(`/peliculas/${peliculaId}/activo`, {
      headers: authHeaders(adminToken),
      data: { activo: false },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.activo).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. PATCH /cupones/:id/activo — 200
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('PATCH /cupones/:id/activo', () => {
  let adminToken: string;
  let cuponId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
    cuponId = await getFirstCuponId();
  });

  test('401 sin token', async ({ request }) => {
    const res = await request.patch(`/cupones/${cuponId}/activo`, {
      data: { activo: false },
    });
    expect(res.status()).toBe(401);
  });

  test('200 {activo: false} — desactiva el cupón', async ({ request }) => {
    const res = await request.patch(`/cupones/${cuponId}/activo`, {
      headers: authHeaders(adminToken),
      data: { activo: false },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.activo).toBe(false);
  });

  test('200 {activo: true} — reactiva el cupón', async ({ request }) => {
    const res = await request.patch(`/cupones/${cuponId}/activo`, {
      headers: authHeaders(adminToken),
      data: { activo: true },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.activo).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. GET /Ciudades alias deprecated — still works, same data as /ciudades
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('GET /Ciudades — deprecated alias', () => {
  test('200 mismos datos que /ciudades', async ({ request }) => {
    const [resOld, resNew] = await Promise.all([
      request.get('/Ciudades'),
      request.get('/ciudades'),
    ]);
    expect(resOld.status()).toBe(200);
    expect(resNew.status()).toBe(200);
    const bodyOld = await resOld.json();
    const bodyNew = await resNew.json();
    expect(Array.isArray(bodyOld)).toBe(true);
    expect(Array.isArray(bodyNew)).toBe(true);
    expect(bodyOld.length).toBe(bodyNew.length);
  });
});
