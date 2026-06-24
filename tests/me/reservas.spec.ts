import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';
import {
  seedFuncionConReserva,
  cleanupReservaSeed,
} from '../helpers/seed-funcion';
import type { ReservaSeed } from '../helpers/seed-funcion';

// ─── 1. Autenticación ────────────────────────────────────────────────────────

test.describe('GET /me/reservas — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.get('/me/reservas');
    expect(res.status()).toBe(401);
  });
});

// ─── 2. Listado con shape Boleto ─────────────────────────────────────────────

test.describe('GET /me/reservas — lista', () => {
  let seed: ReservaSeed;
  let token: string;
  let userId: string;

  test.beforeAll(async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    token = auth.token;
    userId = auth.userId;
    seed = await seedFuncionConReserva(userId);
  });

  test.afterAll(async () => {
    await cleanupReservaSeed(seed);
  });

  test('200 lista mis reservas con shape BoletoView', async ({ request }) => {
    const res = await request.get('/me/reservas', {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);

    // Find the seeded reserva in the list
    const boleto = body.find((b: any) => b.numero_reserva === seed.numero);
    expect(boleto).toBeDefined();
    expect(boleto).toMatchObject({
      numero_reserva: seed.numero,
      estado: 'pendiente_pago',
      pelicula: { titulo: expect.any(String) },
      sala: { nombre: expect.any(String) },
      cine: { nombre: expect.any(String) },
      asientos: expect.any(Array),
    });
    // monto_total is null for pendiente_pago (no pagos row)
    expect(boleto.monto_total).toBeNull();
    // precio should be a numeric string (Decimal serialised to string)
    expect(boleto.asientos.length).toBeGreaterThan(0);
    const precioStr: string | null = boleto.asientos[0].precio;
    expect(precioStr).not.toBeNull();
    expect(Number(precioStr)).toBeGreaterThan(0);
  });

  test('200 filtra por estado con ?estado=pendiente_pago', async ({ request }) => {
    const res = await request.get('/me/reservas?estado=pendiente_pago', {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    body.forEach((b: any) => expect(b.estado).toBe('pendiente_pago'));
  });

  test('200 filtrado por estado diferente devuelve lista (sin la pendiente_pago)', async ({ request }) => {
    const res = await request.get('/me/reservas?estado=pagada', {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    // The seeded reserva is pendiente_pago, so it should NOT appear here
    const found = body.find((b: any) => b.numero_reserva === seed.numero);
    expect(found).toBeUndefined();
  });
});

// ─── 3. Detalle por número ───────────────────────────────────────────────────

test.describe('GET /me/reservas/:numero — detalle', () => {
  let seed: ReservaSeed;
  let token: string;
  let userId: string;

  test.beforeAll(async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    token = auth.token;
    userId = auth.userId;
    seed = await seedFuncionConReserva(userId);
  });

  test.afterAll(async () => {
    await cleanupReservaSeed(seed);
  });

  test('200 devuelve boleto del usuario autenticado', async ({ request }) => {
    const res = await request.get(`/me/reservas/${seed.numero}`, {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      numero_reserva: seed.numero,
      estado: 'pendiente_pago',
      pelicula: { titulo: expect.any(String) },
      sala: { nombre: expect.any(String) },
      cine: { nombre: expect.any(String) },
      asientos: expect.any(Array),
    });
    expect(body.asientos.length).toBeGreaterThan(0);
    expect(body.asientos[0]).toMatchObject({
      codigo: expect.any(String),
      fila: expect.any(String),
      columna: expect.any(Number),
    });
  });

  test('404 si el número existe pero no pertenece al usuario', async ({ request }) => {
    // Login as a different user (admin) and try to access the cliente's reserva
    const other = await loginAs(request, 'admin');
    const res = await request.get(`/me/reservas/${seed.numero}`, {
      headers: authHeaders(other.token),
    });
    expect(res.status()).toBe(404);
  });

  test('404 para número inexistente', async ({ request }) => {
    const res = await request.get('/me/reservas/RES-00000000-XXXXX', {
      headers: authHeaders(token),
    });
    expect(res.status()).toBe(404);
  });
});

// ─── 4. Cancelar (PATCH) ────────────────────────────────────────────────────

test.describe('PATCH /me/reservas/:numero/cancelar', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.patch('/me/reservas/RES-00000000-XXXXX/cancelar');
    expect(res.status()).toBe(401);
  });

  test('cancela reserva pendiente_pago sin crear reembolso', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const seed = await seedFuncionConReserva(auth.userId);

    try {
      const res = await request.patch(`/me/reservas/${seed.numero}/cancelar`, {
        headers: authHeaders(auth.token),
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.reserva.estado).toBe('cancelada');
      expect(body.reserva.numero_reserva).toBe(seed.numero);
      expect(body.reembolso).toBeNull();
    } finally {
      // Asientos were freed by cancelar; only clean up the reserva record
      await cleanupReservaSeed(seed).catch(() => {});
    }
  });

  test('cancela reserva pagada y crea reembolso', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const seed = await seedFuncionConReserva(auth.userId, { pagada: true });

    try {
      const res = await request.patch(`/me/reservas/${seed.numero}/cancelar`, {
        headers: authHeaders(auth.token),
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.reserva.estado).toBe('cancelada');
      expect(body.reembolso).not.toBeNull();
      expect(body.reembolso).toMatchObject({
        id_reembolso: expect.any(String),
        estado: expect.any(String),
        monto: expect.any(String),
      });
    } finally {
      await cleanupReservaSeed(seed).catch(() => {});
    }
  });

  test('404 si la reserva no pertenece al usuario', async ({ request }) => {
    const cliente = await loginAs(request, 'cliente');
    const admin = await loginAs(request, 'admin');
    const seed = await seedFuncionConReserva(cliente.userId);

    try {
      const res = await request.patch(`/me/reservas/${seed.numero}/cancelar`, {
        headers: authHeaders(admin.token),
      });
      expect(res.status()).toBe(404);
    } finally {
      await cleanupReservaSeed(seed);
    }
  });

  test('409 doble cancelación', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const seed = await seedFuncionConReserva(auth.userId);

    // First cancel
    const first = await request.patch(`/me/reservas/${seed.numero}/cancelar`, {
      headers: authHeaders(auth.token),
    });
    expect(first.status()).toBe(200);

    // Second cancel — should 409
    const second = await request.patch(`/me/reservas/${seed.numero}/cancelar`, {
      headers: authHeaders(auth.token),
    });
    expect(second.status()).toBe(409);

    await cleanupReservaSeed(seed).catch(() => {});
  });
});
