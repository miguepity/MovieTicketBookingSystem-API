import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Ciudades, PrismaClient } from '../generated/prisma/client';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('[Seeding] Starting idempotent seed...');
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = 'admin';
  const SALT_ROUNDS = 10;
  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  // 1. Roles
  console.log('[Seeding] Upserting roles...');
  const adminRole = await prisma.roles.upsert({
    where: { nombre: 'admin' },
    update: {},
    create: { nombre: 'admin' },
  });

  await prisma.roles.upsert({
    where: { nombre: 'client' },
    update: {},
    create: { nombre: 'client' },
  });

  // 2. Usuarios
  console.log('[Seeding] Upserting admin user...');
  const adminUser = await prisma.usuarios.upsert({
    where: { email: email },
    update: {},
    create: {
      nombre: 'Admin System',
      email: email,
      id_rol: adminRole.id,
      password_hash: hash,
      estado: 'active',
    },
  });

  // 3. Ciudades
  console.log('[Seeding] Upserting cities...');
  const ciudadesNombres = [
    'San Pedro Sula',
    'Guatemala City',
    'Antigua Guatemala',
  ];
  const ciudades: Ciudades[] = [];
  for (const nombre of ciudadesNombres) {
    const c = await prisma.ciudades.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    ciudades.push(c);
  }

  // 4. Cines, Salas and Asientos
  console.log('[Seeding] Handling cinemas, rooms and seats...');
  const cinesData = [
    {
      nombre: 'Cine City Mall',
      direccion: 'Boulevard Por Ahí',
      id_ciudad: ciudades[1].id,
    },
    {
      nombre: 'Cinemark Mall Galerias',
      direccion: 'Distrito Por Allá',
      id_ciudad: ciudades[1].id,
    },
  ];

  for (const data of cinesData) {
    let cine = await prisma.cines.findFirst({ where: { nombre: data.nombre } });
    if (!cine) {
      cine = await prisma.cines.create({ data });
    }

    let sala = await prisma.salas.findFirst({
      where: { nombre: 'Sala 1 - Premiere', id_cine: cine.id },
    });

    if (!sala) {
      sala = await prisma.salas.create({
        data: {
          nombre: 'Sala 1 - Premiere',
          id_cine: cine.id,
          filas: 5,
          columnas: 8,
        },
      });

      // Generate seats
      const alphabet = 'ABCDE';
      const asientos: {
        id_sala: bigint;
        fila: string;
        columna: number;
        codigo: string;
        tipo: string;
      }[] = [];
      for (let f = 0; f < sala.filas; f++) {
        for (let c = 1; c <= sala.columnas; c++) {
          asientos.push({
            id_sala: sala.id,
            fila: alphabet[f],
            columna: c,
            codigo: `${alphabet[f]}${c}`,
            tipo: 'regular',
          });
        }
      }
      await prisma.asientos.createMany({ data: asientos });
    }
  }

  // 5. Idiomas
  console.log('[Seeding] Upserting languages...');
  const idiomasNombres = ['Español', 'Inglés', 'Subtitulada'];
  const idiomas: { id: bigint; nombre: string }[] = [];
  for (const nombre of idiomasNombres) {
    const i = await prisma.idiomas.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    idiomas.push(i);
  }

  // 6. Generos
  console.log('[Seeding] Upserting genres...');
  const generosNombres = [
    'Acción',
    'Comedia',
    'Drama',
    'Terror',
    'Ciencia Ficción',
  ];
  const generos: { id: bigint; nombre: string }[] = [];
  for (const nombre of generosNombres) {
    const g = await prisma.generos.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    generos.push(g);
  }

  // 7. Peliculas
  console.log('[Seeding] Handling movies...');
  const peliculasData = [
    {
      titulo: 'The Matrix',
      id_idioma: idiomas[1].id,
      id_genero: generos[4].id,
    },
    { titulo: 'Inception', id_idioma: idiomas[1].id, id_genero: generos[4].id },
  ];

  for (const data of peliculasData) {
    let pelicula = await prisma.peliculas.findFirst({
      where: { titulo: data.titulo },
    });
    if (!pelicula) {
      pelicula = await prisma.peliculas.create({
        data: {
          ...data,
          sinopsis: 'Sinopsis de ejemplo...',
          id_usuario: adminUser.id,
          fecha_estreno: new Date(),
        },
      });
    }
  }

  // 8. Politica de Cancelacion
  console.log('[Seeding] Handling cancellation policies...');
  const countPoliticas = await prisma.politicaCancelacion.count();
  if (countPoliticas === 0) {
    await prisma.politicaCancelacion.createMany({
      data: [{ horas_antes_minimo: 4, porcentaje_reembolso: 30.0 }],
    });
  }

  // 9. Funciones and AsientosFuncion
  console.log('[Seeding] Handling functions and seat instances...');
  const allPeliculas = await prisma.peliculas.findMany();
  const allSalas = await prisma.salas.findMany();

  for (const p of allPeliculas) {
    for (const s of allSalas) {
      // Check if there is already a function for this movie/room in the next 24h
      const existingFuncion = await prisma.funciones.findFirst({
        where: { id_pelicula: p.id, id_sala: s.id },
      });

      if (!existingFuncion) {
        const funcion = await prisma.funciones.create({
          data: {
            id_pelicula: p.id,
            id_sala: s.id,
            fecha_hora: new Date(),
            estado: 'active',
          },
        });

        const asientos = await prisma.asientos.findMany({
          where: { id_sala: s.id },
        });
        await prisma.asientosFuncion.createMany({
          data: asientos.map((a, index) => ({
            id_asiento: a.id,
            id_funcion: funcion.id,
            estado: index % 5 === 0 ? 'ocupado' : 'disponible',
            version: 1,
          })),
        });
      }
    }
  }

  // 10. Sample Reservation
  console.log('[Seeding] Creating sample reservation...');
  const firstUser = await prisma.usuarios.findFirst();
  const firstFuncion = await prisma.funciones.findFirst();

  if (firstUser && firstFuncion) {
    const existingReserva = await prisma.reservas.findFirst({
      where: { id_usuario: firstUser.id, id_funcion: firstFuncion.id },
    });

    if (!existingReserva) {
      const reservationNumber = `SEED-RES-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      const reserva = await prisma.reservas.create({
        data: {
          numero_reserva: reservationNumber,
          id_usuario: firstUser.id,
          id_funcion: firstFuncion.id,
          estado: 'confirmada',
        },
      });

      // Tomar 2 asientos disponibles para esta función
      const asientosDisponibles = await prisma.asientosFuncion.findMany({
        where: { id_funcion: firstFuncion.id, estado: 'disponible' },
        take: 2,
      });

      if (asientosDisponibles.length > 0) {
        // Crear relación Reserva-Asientos
        await prisma.reservaAsientos.createMany({
          data: asientosDisponibles.map((af) => ({
            id_reserva: reserva.id,
            id_asiento_funcion: af.id,
          })),
        });

        // Marcar asientos como reservados
        await prisma.asientosFuncion.updateMany({
          where: {
            id: { in: asientosDisponibles.map((af) => af.id) },
          },
          data: {
            estado: 'reservado',
            id_usuario: firstUser.id,
          },
        });
        console.log(
          `[Seeding] Created reservation ${reservationNumber} with 2 seats.`,
        );
      }
    }
  }

  console.log('[Seeding] Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
