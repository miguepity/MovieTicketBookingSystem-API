import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Cines,
  Ciudades,
  Generos,
  Idiomas,
  PrismaClient,
} from '../generated/prisma/client';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('[Seeding] Seeding base data...');
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = 'admin';

  const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  // 1. Roles
  console.log('[Seeding] Creating roles...');
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

  await prisma.roles.upsert({
    where: { nombre: 'admin' },
    update: {},
    create: { nombre: 'admin' },
  });

  // 2. Usuarios
  console.log('[Seeding] Creating admin user...');
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
  console.log('[Seeding] Creating cities...');
  const ciudadesData = [{ nombre: 'San Pedro Sula' }, { nombre: 'Guatemala' }];

  const ciudades: Ciudades[] = [];
  for (const ciudad of ciudadesData) {
    const c = await prisma.ciudades.upsert({
      where: { nombre: ciudad.nombre },
      update: {},
      create: ciudad,
    });
    ciudades.push(c);
  }

  // 4. Cines
  console.log('[Seeding] Creating cinemas...');
  const cinesData = [
    {
      nombre: 'Cinépolis Cayalá',
      direccion: 'Paseo Cayalá, Zona 16',
      id_ciudad: ciudades[0].id,
    },
    {
      nombre: 'Cinemark Majadas',
      direccion: 'Parque Majadas, Zona 11',
      id_ciudad: ciudades[0].id,
    },
    {
      nombre: 'Alba Cinema Antigua',
      direccion: 'Centro Comercial La Recolección',
      id_ciudad: ciudades[1].id,
    },
  ];

  const cines: Cines[] = [];
  for (const cine of cinesData) {
    const c = await prisma.cines.create({
      data: cine,
    });
    cines.push(c);
  }

  // 5. Salas and Asientos
  console.log('[Seeding] Creating rooms and seats...');
  for (const cine of cines) {
    const sala = await prisma.salas.create({
      data: {
        nombre: 'Sala 1 - Premiere',
        id_cine: cine.id,
        filas: 5,
        columnas: 8,
      },
    });

    // Generate seats for this room
    const alphabet = 'ABCDEFGHIJ';
    const asientos: {
      id_sala: bigint;
      fila: string;
      columna: number;
      codigo: string;
      tipo: string;
    }[] = [];
    for (let f = 0; f < sala.filas; f++) {
      const filaLetra = alphabet[f];
      for (let c = 1; c <= sala.columnas; c++) {
        asientos.push({
          id_sala: sala.id,
          fila: filaLetra,
          columna: c,
          codigo: `${filaLetra}${c}`,
          tipo: 'regular',
        });
      }
    }
    await prisma.asientos.createMany({
      data: asientos,
    });
  }

  // 6. Idiomas
  console.log('[Seeding] Creating languages...');
  const idiomasData = [
    { nombre: 'Español' },
    { nombre: 'Inglés' },
    { nombre: 'Subtitulada' },
  ];
  const idiomas: Idiomas[] = [];
  for (const idioma of idiomasData) {
    const i = await prisma.idiomas.upsert({
      where: { nombre: idioma.nombre },
      update: {},
      create: idioma,
    });
    idiomas.push(i);
  }

  // 7. Generos
  console.log('[Seeding] Creating genres...');
  const generosData = [
    { nombre: 'Acción' },
    { nombre: 'Comedia' },
    { nombre: 'Drama' },
    { nombre: 'Terror' },
    { nombre: 'Ciencia Ficción' },
  ];
  const generos: Generos[] = [];
  for (const genero of generosData) {
    const g = await prisma.generos.upsert({
      where: { nombre: genero.nombre },
      update: {},
      create: genero,
    });
    generos.push(g);
  }

  // 8. Peliculas
  console.log('[Seeding] Creating movies...');
  const peliculasData = [
    {
      titulo: 'The Matrix',
      sinopsis:
        'Un programador de computación descubre que el mundo en el que vive es una simulación.',
      id_idioma: idiomas[1].id,
      id_genero: generos[4].id,
      fecha_estreno: new Date('1999-03-31'),
      id_usuario: adminUser.id,
    },
    {
      titulo: 'Inception',
      sinopsis:
        'Un ladrón que roba secretos corporativos a través del uso de la tecnología de compartir sueños.',
      id_idioma: idiomas[1].id,
      id_genero: generos[4].id,
      fecha_estreno: new Date('2010-07-16'),
      id_usuario: adminUser.id,
    },
    {
      titulo: 'El Padrino',
      sinopsis:
        'El patriarca de una organización criminal transfiere el control de su imperio clandestino a su hijo.',
      id_idioma: idiomas[0].id,
      id_genero: generos[2].id,
      fecha_estreno: new Date('1972-03-24'),
      id_usuario: adminUser.id,
    },
  ];

  for (const pelicula of peliculasData) {
    await prisma.peliculas.create({
      data: pelicula,
    });
  }

  // 9. Politica de Cancelacion
  console.log('[Seeding] Creating cancellation policies...');
  await prisma.politicaCancelacion.createMany({
    data: [
      {
        horas_antes_minimo: 24,
        horas_antes_maximo: null,
        porcentaje_reembolso: 100.0,
      },
      {
        horas_antes_minimo: 12,
        horas_antes_maximo: 24,
        porcentaje_reembolso: 50.0,
      },
      {
        horas_antes_minimo: 0,
        horas_antes_maximo: 12,
        porcentaje_reembolso: 0.0,
      },
    ],
  });

  console.log('[Seeding] Seed completed!');
}

void main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('[Seeding] Seeding completed successfully');
  })
  .catch(async (e) => {
    console.error('[Seeding] Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
