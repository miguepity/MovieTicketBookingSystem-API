/* eslint-disable @typescript-eslint/no-unsafe-return */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
// Permite serializar BigInt en logs
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function main() {
  console.log('🌱 Iniciando seed...');

  // ── Limpieza de datos transaccionales ───────────────────
  // Permite re-correr el seed varias veces sin chocar con unique constraints
  // (los datos maestros de abajo usan upsert, así que no hace falta borrarlos)
  await prisma.reembolsos.deleteMany();
  await prisma.pagos.deleteMany();
  await prisma.reservaAsientos.deleteMany();
  await prisma.reservas.deleteMany();
  await prisma.asientosFuncion.deleteMany();
  await prisma.funciones.deleteMany();
  await prisma.peliculas.deleteMany();
  await prisma.asientos.deleteMany();
  await prisma.salas.deleteMany();
  await prisma.cines.deleteMany();
  console.log('🧹 Datos transaccionales limpiados');

  // ── Roles ──────────────────────────────────────────────
  const [rolAdmin, rolRecepcionista, rolCliente] = await Promise.all([
    prisma.roles.upsert({
      where: { nombre: 'admin' },
      update: {},
      create: { nombre: 'admin' },
    }),
    prisma.roles.upsert({
      where: { nombre: 'recepcionista' },
      update: {},
      create: { nombre: 'recepcionista' },
    }),
    prisma.roles.upsert({
      where: { nombre: 'cliente' },
      update: {},
      create: { nombre: 'cliente' },
    }),
  ]);
  console.log('✅ Roles creados');

  // ── Idiomas ────────────────────────────────────────────
  const [espanol, ingles, japones] = await Promise.all([
    prisma.idiomas.upsert({
      where: { nombre: 'Español' },
      update: {},
      create: { nombre: 'Español' },
    }),
    prisma.idiomas.upsert({
      where: { nombre: 'Inglés' },
      update: {},
      create: { nombre: 'Inglés' },
    }),
    prisma.idiomas.upsert({
      where: { nombre: 'Japonés' },
      update: {},
      create: { nombre: 'Japonés' },
    }),
  ]);
  console.log('✅ Idiomas creados');

  // ── Géneros ────────────────────────────────────────────
  const [accion, drama, , , animacion] = await Promise.all([
    prisma.generos.upsert({
      where: { nombre: 'Acción' },
      update: {},
      create: { nombre: 'Acción' },
    }),
    prisma.generos.upsert({
      where: { nombre: 'Drama' },
      update: {},
      create: { nombre: 'Drama' },
    }),
    prisma.generos.upsert({
      where: { nombre: 'Comedia' },
      update: {},
      create: { nombre: 'Comedia' },
    }),
    prisma.generos.upsert({
      where: { nombre: 'Terror' },
      update: {},
      create: { nombre: 'Terror' },
    }),
    prisma.generos.upsert({
      where: { nombre: 'Animación' },
      update: {},
      create: { nombre: 'Animación' },
    }),
  ]);
  console.log('✅ Géneros creados');

  // ── Ciudades ───────────────────────────────────────────
  const [tegucigalpa, sps] = await Promise.all([
    prisma.ciudades.upsert({
      where: { nombre: 'Tegucigalpa' },
      update: {},
      create: { nombre: 'Tegucigalpa' },
    }),
    prisma.ciudades.upsert({
      where: { nombre: 'San Pedro Sula' },
      update: {},
      create: { nombre: 'San Pedro Sula' },
    }),
    prisma.ciudades.upsert({
      where: { nombre: 'La Ceiba' },
      update: {},
      create: { nombre: 'La Ceiba' },
    }),
  ]);
  console.log('✅ Ciudades creadas');

  // ── Usuarios ───────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const [admin, , cliente1] = await Promise.all([
    prisma.usuarios.upsert({
      where: { email: 'admin@movieticket.com' },
      update: {},
      create: {
        nombre: 'Administrador',
        email: 'admin@movieticket.com',
        password_hash: passwordHash,
        id_rol: rolAdmin.id,
        estado: 'activo',
        notificaciones_activas: true,
      },
    }),
    prisma.usuarios.upsert({
      where: { email: 'recepcionista@movieticket.com' },
      update: {},
      create: {
        nombre: 'Juan Recepcionista',
        email: 'recepcionista@movieticket.com',
        password_hash: passwordHash,
        id_rol: rolRecepcionista.id,
        estado: 'activo',
        notificaciones_activas: false,
      },
    }),
    prisma.usuarios.upsert({
      where: { email: 'cliente1@movieticket.com' },
      update: {},
      create: {
        nombre: 'María López',
        email: 'cliente1@movieticket.com',
        password_hash: passwordHash,
        id_rol: rolCliente.id,
        estado: 'activo',
        notificaciones_activas: true,
      },
    }),
    prisma.usuarios.upsert({
      where: { email: 'cliente2@movieticket.com' },
      update: {},
      create: {
        nombre: 'Carlos Méndez',
        email: 'cliente2@movieticket.com',
        password_hash: passwordHash,
        id_rol: rolCliente.id,
        estado: 'activo',
        notificaciones_activas: true,
      },
    }),
  ]);
  console.log('✅ Usuarios creados');

  // ── Cines ──────────────────────────────────────────────
  const [cineTegus] = await Promise.all([
    prisma.cines.create({
      data: {
        nombre: 'MovieTicket Tegucigalpa',
        direccion: 'Mall Multiplaza, Tegucigalpa',
        id_ciudad: tegucigalpa.id,
      },
    }),
    prisma.cines.create({
      data: {
        nombre: 'MovieTicket San Pedro Sula',
        direccion: 'City Mall, San Pedro Sula',
        id_ciudad: sps.id,
      },
    }),
  ]);
  console.log('✅ Cines creados');

  // ── Salas ──────────────────────────────────────────────
  const sala1 = await prisma.salas.create({
    data: {
      nombre: 'Sala 1',
      id_cine: BigInt(cineTegus.id),
      filas: 8,
      columnas: 10,
    },
  });
  console.log('✅ Sala creada');

  // ── Asientos ───────────────────────────────────────────
  const filas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const asientoOps: ReturnType<typeof prisma.asientos.create>[] = [];

  for (let f = 0; f < sala1.filas; f++) {
    for (let c = 1; c <= sala1.columnas; c++) {
      asientoOps.push(
        prisma.asientos.create({
          data: {
            id_sala: BigInt(sala1.id),
            fila: filas[f],
            columna: c,
            codigo: `${filas[f]}-${String(c).padStart(2, '0')}`,
            tipo: f === 0 ? 'VIP' : 'ESTANDAR',
          },
        }),
      );
    }
  }

  const asientosCreados = await Promise.all(asientoOps);
  console.log(`✅ ${asientosCreados.length} asientos creados`);

  // ── Películas ──────────────────────────────────────────
  const [pelicula1, pelicula2] = await Promise.all([
    prisma.peliculas.create({
      data: {
        titulo: 'El Último Horizonte',
        sinopsis: 'Un viaje épico hacia lo desconocido.',
        id_idioma: espanol.id,
        id_genero: accion.id,
        fecha_estreno: new Date('2026-07-01'),
        activo: true,
        id_usuario: admin.id,
        dur: '2h 13m',
        year: 2008,
      },
    }),
    prisma.peliculas.create({
      data: {
        titulo: 'Sombras del Pasado',
        sinopsis: 'Un drama que explora los secretos de una familia.',
        id_idioma: ingles.id,
        id_genero: drama.id,
        fecha_estreno: new Date('2026-07-15'),
        activo: true,
        id_usuario: admin.id,
        dur: '1h 30m',
        year: 2007,
      },
    }),
  ]);

  // Películas icónicas reales, solo para tener pósters de ejemplo creíbles
  const [elReyLeon, frozen, toyStory, fastAndFurious, chihiro] =
    await Promise.all([
      prisma.peliculas.create({
        data: {
          titulo: 'El Rey León',
          sinopsis:
            'Un joven león debe asumir su lugar como rey tras la muerte de su padre.',
          poster_url:
            'https://upload.wikimedia.org/wikipedia/en/3/3d/The_Lion_King_poster.jpg',
          id_idioma: ingles.id,
          id_genero: animacion.id,
          fecha_estreno: new Date('1994-06-15'),
          activo: true,
          id_usuario: admin.id,
          dur: '1h 28m',
          year: 1994,
        },
      }),
      prisma.peliculas.create({
        data: {
          titulo: 'Frozen: Una Aventura Congelada',
          sinopsis:
            'Una princesa se embarca en un viaje junto a un montañista y su reno para encontrar a su hermana.',
          poster_url:
            'https://upload.wikimedia.org/wikipedia/en/0/05/Frozen_%282013_film%29_poster.jpg',
          id_idioma: ingles.id,
          id_genero: animacion.id,
          fecha_estreno: new Date('2013-11-27'),
          activo: true,
          id_usuario: admin.id,
          dur: '1h 42m',
          year: 2013,
        },
      }),
      prisma.peliculas.create({
        data: {
          titulo: 'Toy Story',
          sinopsis:
            'Los juguetes de Andy temen perder su lugar cuando llega Buzz Lightyear.',
          poster_url:
            'https://upload.wikimedia.org/wikipedia/en/1/13/Toy_Story.jpg',
          id_idioma: ingles.id,
          id_genero: animacion.id,
          fecha_estreno: new Date('1995-11-22'),
          activo: true,
          id_usuario: admin.id,
          dur: '1h 21m',
          year: 1995,
        },
      }),
      prisma.peliculas.create({
        data: {
          titulo: 'Fast & Furious',
          sinopsis:
            'Dominic Toretto y su equipo regresan para una nueva carrera contra el crimen.',
          poster_url:
            'https://upload.wikimedia.org/wikipedia/en/8/8f/Fast_and_Furious_Poster.jpg',
          id_idioma: ingles.id,
          id_genero: accion.id,
          fecha_estreno: new Date('2009-04-03'),
          activo: true,
          id_usuario: admin.id,
          dur: '1h 47m',
          year: 2009,
        },
      }),
      prisma.peliculas.create({
        data: {
          titulo: 'El Viaje de Chihiro',
          sinopsis:
            'Chihiro debe trabajar en una casa de baños habitada por espíritus para salvar a sus padres.',
          poster_url:
            'https://upload.wikimedia.org/wikipedia/en/d/db/Spirited_Away_Japanese_poster.png',
          id_idioma: japones.id,
          id_genero: animacion.id,
          fecha_estreno: new Date('2001-07-20'),
          activo: true,
          id_usuario: admin.id,
          dur: '2h 5m',
          year: 2001,
        },
      }),
    ]);
  console.log('✅ Películas creadas');

  // ── Funciones ──────────────────────────────────────────
  const funcion1 = await prisma.funciones.create({
    data: {
      id_pelicula: BigInt(pelicula1.id),
      id_sala: BigInt(sala1.id),
      fecha_hora: new Date('2026-07-01T20:00:00'),
      estado: 'activa',
      formato: '3D - Subtitulada',
    },
  });

  const funcion2 = await prisma.funciones.create({
    data: {
      id_pelicula: BigInt(pelicula2.id),
      id_sala: BigInt(sala1.id),
      fecha_hora: new Date('2026-07-02T18:00:00'),
      estado: 'activa',
      formato: '2D - Subtitulada',
    },
  });

  const funcionesIconicas = await Promise.all([
    prisma.funciones.create({
      data: {
        id_pelicula: BigInt(elReyLeon.id),
        id_sala: BigInt(sala1.id),
        fecha_hora: new Date('2026-07-03T16:00:00'),
        estado: 'activa',
        formato: '2D - Doblada',
      },
    }),
    prisma.funciones.create({
      data: {
        id_pelicula: BigInt(frozen.id),
        id_sala: BigInt(sala1.id),
        fecha_hora: new Date('2026-07-03T19:00:00'),
        estado: 'activa',
        formato: '2D - Doblada',
      },
    }),
    prisma.funciones.create({
      data: {
        id_pelicula: BigInt(toyStory.id),
        id_sala: BigInt(sala1.id),
        fecha_hora: new Date('2026-07-04T15:00:00'),
        estado: 'activa',
        formato: '2D - Doblada',
      },
    }),
    prisma.funciones.create({
      data: {
        id_pelicula: BigInt(fastAndFurious.id),
        id_sala: BigInt(sala1.id),
        fecha_hora: new Date('2026-07-04T21:00:00'),
        estado: 'activa',
        formato: '2D - Subtitulada',
      },
    }),
    prisma.funciones.create({
      data: {
        id_pelicula: BigInt(chihiro.id),
        id_sala: BigInt(sala1.id),
        fecha_hora: new Date('2026-07-05T18:30:00'),
        estado: 'activa',
        formato: '2D - Subtitulada',
      },
    }),
  ]);
  console.log('✅ Funciones creadas');

  // ── AsientosFuncion ────────────────────────────────────
  // Cada función necesita su propio set de asientos_funcion (uno por asiento de la sala)
  await Promise.all(
    [funcion1, funcion2, ...funcionesIconicas].flatMap((funcion) =>
      asientosCreados.map((asiento) =>
        prisma.asientosFuncion.create({
          data: {
            id_asiento: BigInt(asiento.id),
            id_funcion: BigInt(funcion.id),
            estado: 'disponible',
            bloqueado_hasta: new Date(),
            version: 0,
          },
        }),
      ),
    ),
  );
  console.log('✅ AsientosFuncion creados');

  // ── Reserva de ejemplo ─────────────────────────────────
  const reserva = await prisma.reservas.create({
    data: {
      numero_reserva: 'RES-000001',
      id_usuario: BigInt(cliente1.id),
      id_funcion: BigInt(funcion1.id),
      estado: 'pendiente',
    },
  });
  console.log('✅ Reserva de ejemplo creada');

  // ── Cupones ────────────────────────────────────────────
  await Promise.all([
    prisma.cupones.upsert({
      where: { codigo: 'DESCUENTO10' },
      update: {},
      create: {
        codigo: 'DESCUENTO10',
        tipo: 'porcentaje',
        valor: '10.00',
        fecha_expiracion: new Date('2026-12-31'),
        usos_maximos: 100,
        activo: true,
      },
    }),
    prisma.cupones.upsert({
      where: { codigo: 'PROMO50' },
      update: {},
      create: {
        codigo: 'PROMO50',
        tipo: 'fijo',
        valor: '50.00',
        fecha_expiracion: new Date('2026-09-30'),
        usos_maximos: 20,
        activo: true,
      },
    }),
  ]);
  console.log('✅ Cupones creados');

  // ── Política de cancelación ────────────────────────────
  await prisma.politicaCancelacion.createMany({
    data: [
      {
        horas_antes_minimo: 48,
        horas_antes_maximo: null,
        porcentaje_reembolso: '100.00',
      },
      {
        horas_antes_minimo: 24,
        horas_antes_maximo: 47,
        porcentaje_reembolso: '50.00',
      },
      {
        horas_antes_minimo: 0,
        horas_antes_maximo: 23,
        porcentaje_reembolso: '0.00',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Políticas de cancelación creadas');

  // ── Pago de ejemplo ────────────────────────────────────
  await prisma.pagos.create({
    data: {
      id_reserva: BigInt(reserva.id),
      monto_original: '150.00',
      monto_descuento: '0.00',
      monto_final: '150.00',
      metodo: 'tarjeta',
      estado: 'completado',
    },
  });
  console.log('✅ Pago de ejemplo creado');

  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
