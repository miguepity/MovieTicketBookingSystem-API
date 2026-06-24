import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

describe('GET /admin/funciones/conflictos (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let adminToken: string;
  let clienteToken: string;

  // IDs for seeded data – cleaned up after all tests
  let idCine: bigint;
  let idSala: bigint;
  let idPelicula: bigint;
  let idFuncion: bigint; // an existing scheduled funcion

  // Base fecha_hora used for overlap testing (far future to avoid "already started" issues)
  const BASE_FECHA = new Date('2030-12-01T20:00:00Z');
  const DURACION_MIN = 120; // 2-hour movie

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // --- Seed minimal data ---

    // 1. Ensure roles exist
    const adminRol = await prisma.roles.upsert({
      where: { nombre: 'admin' },
      update: {},
      create: { nombre: 'admin' },
    });
    const clienteRol = await prisma.roles.upsert({
      where: { nombre: 'cliente' },
      update: {},
      create: { nombre: 'cliente' },
    });

    // 2. Ensure ciudad exists
    const ciudad = await prisma.ciudades.upsert({
      where: { nombre: 'TestCity_Conflictos' },
      update: {},
      create: { nombre: 'TestCity_Conflictos' },
    });

    // 3. Ensure cine
    let cine = await prisma.cines.findFirst({ where: { nombre: 'TestCine_Conflictos' } });
    if (!cine) {
      cine = await prisma.cines.create({
        data: { nombre: 'TestCine_Conflictos', id_ciudad: ciudad.id },
      });
    }
    idCine = cine.id;

    // 4. Ensure sala (with asientos so generarAsientos works)
    let sala = await prisma.salas.findFirst({ where: { nombre: 'TestSala_Conflictos', id_cine: idCine } });
    if (!sala) {
      sala = await prisma.salas.create({
        data: { nombre: 'TestSala_Conflictos', id_cine: idCine, filas: 2, columnas: 2 },
      });
      // Create 4 asientos for the sala (tipo requerido: find or create tipo_asiento)
      let tipo = await prisma.tiposAsiento.findFirst({});
      if (!tipo) {
        tipo = await prisma.tiposAsiento.create({ data: { nombre: 'Estandar_Test' } });
      }
      for (let f = 1; f <= 2; f++) {
        const fila = String.fromCharCode(64 + f);
        for (let c = 1; c <= 2; c++) {
          await prisma.asientos.create({
            data: {
              id_sala: sala.id,
              fila,
              columna: c,
              codigo: `${fila}${c}`,
              id_tipo_asiento: tipo.id,
            },
          });
        }
      }
    }
    idSala = sala.id;

    // 5. Pelicula (120 min duration) — needs id_usuario; use or create a throwaway user
    const adminUser = await prisma.usuarios.upsert({
      where: { email: 'admin@cinema.com' },
      update: {},
      create: {
        nombre: 'Admin Test',
        email: 'admin@cinema.com',
        password_hash: '$2b$10$abc', // placeholder
        id_rol: adminRol.id,
        estado: 'activo',
      },
      select: { id: true },
    });

    let peli = await prisma.peliculas.findFirst({ where: { titulo: 'TestPelicula_Conflictos' } });
    if (!peli) {
      peli = await prisma.peliculas.create({
        data: {
          titulo: 'TestPelicula_Conflictos',
          duracion_min: DURACION_MIN,
          activo: true,
          id_usuario: adminUser.id,
        },
      });
    }
    idPelicula = peli.id;

    // 6. Create an existing "programada" funcion at BASE_FECHA in our sala
    // (clean any leftover first)
    await prisma.asientosFuncion.deleteMany({
      where: { funciones: { id_sala: idSala, id_pelicula: idPelicula } },
    });
    await prisma.funciones.deleteMany({
      where: { id_sala: idSala, id_pelicula: idPelicula },
    });

    const existingFuncion = await prisma.funciones.create({
      data: {
        id_pelicula: idPelicula,
        id_sala: idSala,
        fecha_hora: BASE_FECHA,
        estado: 'programada',
      },
    });
    idFuncion = existingFuncion.id;

    // 7. Mint JWT tokens without hitting the DB login (faster, no password hash)
    adminToken = jwtService.sign({
      email: 'admin@test-conflictos.com',
      sub: '9999001',
      idRol: '1',
      rol: 'admin',
      jti: 'test-admin-jti-conflictos',
    });

    clienteToken = jwtService.sign({
      email: 'cliente@test-conflictos.com',
      sub: '9999002',
      idRol: '2',
      rol: 'cliente',
      jti: 'test-cliente-jti-conflictos',
    });
  });

  afterAll(async () => {
    if (prisma && idSala) {
      // Clean up test data in dependency order
      await prisma.asientosFuncion.deleteMany({
        where: { funciones: { id_sala: idSala } },
      });
      await prisma.funciones.deleteMany({ where: { id_sala: idSala } });
      await prisma.asientos.deleteMany({ where: { id_sala: idSala } });
      await prisma.salas.deleteMany({ where: { id: idSala } });
    }
    if (prisma && idCine) {
      await prisma.cines.deleteMany({ where: { id: idCine } });
    }
    if (prisma && idPelicula) {
      await prisma.peliculas.deleteMany({ where: { id: idPelicula } });
    }
    if (prisma) {
      await prisma.ciudades.deleteMany({ where: { nombre: 'TestCity_Conflictos' } });
    }
    if (app) {
      await app.close();
    }
  });

  // Helper to build query params
  function buildQuery(opts: {
    id_cine?: bigint | string;
    id_sala?: bigint | string;
    fecha_hora?: string;
    duracion_min?: number;
    ignorar_id?: bigint | string;
  }) {
    const qs = new URLSearchParams();
    if (opts.id_cine !== undefined) qs.set('id_cine', opts.id_cine.toString());
    if (opts.id_sala !== undefined) qs.set('id_sala', opts.id_sala.toString());
    if (opts.fecha_hora !== undefined) qs.set('fecha_hora', opts.fecha_hora);
    if (opts.duracion_min !== undefined) qs.set('duracion_min', opts.duracion_min.toString());
    if (opts.ignorar_id !== undefined) qs.set('ignorar_id', opts.ignorar_id.toString());
    return qs.toString();
  }

  const VALID_QUERY = () =>
    buildQuery({
      id_cine: idCine,
      id_sala: idSala,
      // Query for a window that overlaps with BASE_FECHA: start 30 min before, 120 min duration
      fecha_hora: new Date(BASE_FECHA.getTime() - 30 * 60000).toISOString(),
      duracion_min: DURACION_MIN,
    });

  describe('auth / authz', () => {
    it('401 without token', async () => {
      await request(app.getHttpServer())
        .get('/admin/funciones/conflictos?' + VALID_QUERY())
        .expect(401);
    });

    it('403 with cliente token (not admin)', async () => {
      await request(app.getHttpServer())
        .get('/admin/funciones/conflictos?' + VALID_QUERY())
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(403);
    });
  });

  describe('overlap detection', () => {
    it('returns the conflicting funcion when windows overlap', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/funciones/conflictos?' + VALID_QUERY())
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);

      const found = res.body.find(
        (c: { id: string }) => c.id === idFuncion.toString(),
      );
      expect(found).toBeDefined();
      expect(found).toMatchObject({
        fecha_hora: BASE_FECHA.toISOString(),
        pelicula: { titulo: 'TestPelicula_Conflictos' },
      });
      expect(found.fecha_hora_fin).toBeDefined();
    });

    it('returns empty when ignorar_id equals the conflicting funcion id', async () => {
      const qs = buildQuery({
        id_cine: idCine,
        id_sala: idSala,
        fecha_hora: new Date(BASE_FECHA.getTime() - 30 * 60000).toISOString(),
        duracion_min: DURACION_MIN,
        ignorar_id: idFuncion,
      });

      const res = await request(app.getHttpServer())
        .get(`/admin/funciones/conflictos?${qs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find(
        (c: { id: string }) => c.id === idFuncion.toString(),
      );
      expect(found).toBeUndefined();
    });

    it('returns empty for a non-overlapping time range', async () => {
      // Query window that ends before BASE_FECHA starts: BASE_FECHA - 3h, 60 min duration
      const fechaNonOverlap = new Date(BASE_FECHA.getTime() - 3 * 60 * 60000);
      const qs = buildQuery({
        id_cine: idCine,
        id_sala: idSala,
        fecha_hora: fechaNonOverlap.toISOString(),
        duracion_min: 60,
      });

      const res = await request(app.getHttpServer())
        .get(`/admin/funciones/conflictos?${qs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      // None of the results should be our existing funcion
      const found = res.body.find(
        (c: { id: string }) => c.id === idFuncion.toString(),
      );
      expect(found).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('400 when required query params are missing', async () => {
      await request(app.getHttpServer())
        .get('/admin/funciones/conflictos')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('400 when fecha_hora is not a valid date string', async () => {
      const qs = buildQuery({
        id_cine: idCine,
        id_sala: idSala,
        fecha_hora: 'not-a-date',
        duracion_min: 90,
      });
      await request(app.getHttpServer())
        .get(`/admin/funciones/conflictos?${qs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('400 when duracion_min is 0 (must be >= 1)', async () => {
      const qs = buildQuery({
        id_cine: idCine,
        id_sala: idSala,
        fecha_hora: BASE_FECHA.toISOString(),
        duracion_min: 0,
      });
      await request(app.getHttpServer())
        .get(`/admin/funciones/conflictos?${qs}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });
});
