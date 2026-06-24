import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth';

// ─── 1. Auth guards ───────────────────────────────────────────────────────────

test.describe('GET /admin/precios/matriz — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.get('/admin/precios/matriz');
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const res = await request.get('/admin/precios/matriz', {
      headers: authHeaders(auth.token),
    });
    expect(res.status()).toBe(403);
  });
});

test.describe('POST /admin/precios/matriz — auth', () => {
  test('401 sin token', async ({ request }) => {
    const res = await request.post('/admin/precios/matriz', {
      data: { defaults: {}, cines: [] },
    });
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const res = await request.post('/admin/precios/matriz', {
      headers: authHeaders(auth.token),
      data: { defaults: {}, cines: [] },
    });
    expect(res.status()).toBe(403);
  });
});

// ─── 2. GET matriz shape ──────────────────────────────────────────────────────

test.describe('GET /admin/precios/matriz — shape', () => {
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;
  });

  test('200 retorna shape { tipos_asiento, defaults, cines }', async ({ request }) => {
    const res = await request.get('/admin/precios/matriz', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('tipos_asiento');
    expect(body).toHaveProperty('defaults');
    expect(body).toHaveProperty('cines');
    expect(Array.isArray(body.tipos_asiento)).toBe(true);
    expect(Array.isArray(body.cines)).toBe(true);
    expect(typeof body.defaults).toBe('object');
  });

  test('tipos_asiento tienen id, nombre, color', async ({ request }) => {
    const res = await request.get('/admin/precios/matriz', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    if (body.tipos_asiento.length > 0) {
      const tipo = body.tipos_asiento[0];
      expect(tipo).toHaveProperty('id');
      expect(tipo).toHaveProperty('nombre');
      expect(tipo).toHaveProperty('color');
    }
  });

  test('cines tienen id, nombre, ciudad, precios', async ({ request }) => {
    const res = await request.get('/admin/precios/matriz', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    if (body.cines.length > 0) {
      const cine = body.cines[0];
      expect(cine).toHaveProperty('id');
      expect(cine).toHaveProperty('nombre');
      expect(cine).toHaveProperty('ciudad');
      expect(cine).toHaveProperty('precios');
      expect(typeof cine.precios).toBe('object');
    }
  });
});

// ─── 3. POST matriz con defaults + roundtrip ──────────────────────────────────

test.describe('POST /admin/precios/matriz — defaults + per-cine', () => {
  let adminToken: string;
  let tipoId: string;
  let cineId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    // Get current matrix to find valid ids
    const matrizRes = await request.get('/admin/precios/matriz', {
      headers: authHeaders(adminToken),
    });
    const matriz = await matrizRes.json();

    if (matriz.tipos_asiento.length === 0) {
      throw new Error('No hay tipos_asiento en la base de datos. Ejecuta el seed.');
    }
    tipoId = matriz.tipos_asiento[0].id;

    if (matriz.cines.length === 0) {
      throw new Error('No hay cines en la base de datos. Ejecuta el seed.');
    }
    cineId = matriz.cines[0].id;
  });

  test('200 POST defaults + cines y GET roundtrip preserva valores', async ({ request }) => {
    const defaultPrecio = 12.50;
    const cinePrecio = 18.00;

    const postRes = await request.post('/admin/precios/matriz', {
      headers: authHeaders(adminToken),
      data: {
        defaults: { [tipoId]: defaultPrecio },
        cines: [{ id_cine: cineId, precios: { [tipoId]: cinePrecio } }],
      },
    });
    expect([200, 201]).toContain(postRes.status());
    const postBody = await postRes.json();
    expect(postBody).toHaveProperty('defaults');
    expect(postBody).toHaveProperty('cines');
    expect(postBody).toHaveProperty('tipos_asiento');

    // GET roundtrip
    const getRes = await request.get('/admin/precios/matriz', {
      headers: authHeaders(adminToken),
    });
    expect(getRes.status()).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.defaults[tipoId]).toBe(defaultPrecio);

    const cineData = getBody.cines.find((c: any) => c.id === cineId);
    expect(cineData).toBeDefined();
    expect(cineData.precios[tipoId]).toBe(cinePrecio);
  });

  test('200 POST null defaults elimina el default', async ({ request }) => {
    // First ensure there is a default
    await request.post('/admin/precios/matriz', {
      headers: authHeaders(adminToken),
      data: {
        defaults: { [tipoId]: 10.00 },
        cines: [],
      },
    });

    // Now remove it with null
    const postRes = await request.post('/admin/precios/matriz', {
      headers: authHeaders(adminToken),
      data: {
        defaults: { [tipoId]: null },
        cines: [],
      },
    });
    expect([200, 201]).toContain(postRes.status());

    // GET to verify removal
    const getRes = await request.get('/admin/precios/matriz', {
      headers: authHeaders(adminToken),
    });
    expect(getRes.status()).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.defaults[tipoId]).toBeUndefined();
  });

  test('400 precio negativo en defaults', async ({ request }) => {
    const res = await request.post('/admin/precios/matriz', {
      headers: authHeaders(adminToken),
      data: {
        defaults: { [tipoId]: -5 },
        cines: [],
      },
    });
    expect(res.status()).toBe(400);
  });

  test('400 precio cero en defaults', async ({ request }) => {
    const res = await request.post('/admin/precios/matriz', {
      headers: authHeaders(adminToken),
      data: {
        defaults: { [tipoId]: 0 },
        cines: [],
      },
    });
    expect(res.status()).toBe(400);
  });

  test('400 tipo_asiento inexistente en defaults', async ({ request }) => {
    const res = await request.post('/admin/precios/matriz', {
      headers: authHeaders(adminToken),
      data: {
        defaults: { '9999999': 10.00 },
        cines: [],
      },
    });
    expect(res.status()).toBe(400);
  });

  test('400 tipo_asiento inexistente en cines', async ({ request }) => {
    const res = await request.post('/admin/precios/matriz', {
      headers: authHeaders(adminToken),
      data: {
        defaults: {},
        cines: [{ id_cine: cineId, precios: { '9999999': 10.00 } }],
      },
    });
    expect(res.status()).toBe(400);
  });
});

// ─── 4. GET cine/:id ─────────────────────────────────────────────────────────

test.describe('GET /admin/precios/cine/:idCine', () => {
  let adminToken: string;
  let cineId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAs(request, 'admin');
    adminToken = admin.token;

    const matrizRes = await request.get('/admin/precios/matriz', {
      headers: authHeaders(adminToken),
    });
    const matriz = await matrizRes.json();
    if (matriz.cines.length === 0) {
      throw new Error('No hay cines en la base de datos. Ejecuta el seed.');
    }
    cineId = matriz.cines[0].id;
  });

  test('401 sin token', async ({ request }) => {
    const res = await request.get(`/admin/precios/cine/${cineId}`);
    expect(res.status()).toBe(401);
  });

  test('403 si es cliente', async ({ request }) => {
    const auth = await loginAs(request, 'cliente');
    const res = await request.get(`/admin/precios/cine/${cineId}`, {
      headers: authHeaders(auth.token),
    });
    expect(res.status()).toBe(403);
  });

  test('200 retorna array de precios del cine', async ({ request }) => {
    const res = await request.get(`/admin/precios/cine/${cineId}`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});
