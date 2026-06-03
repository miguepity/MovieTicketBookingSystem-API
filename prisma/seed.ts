import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function upsertByNombre<T extends { id: bigint; nombre: string }>(
  table: { upsert: (args: any) => Promise<T> },
  nombre: string,
  extra: Record<string, unknown> = {},
): Promise<T> {
  return table.upsert({
    where: { nombre },
    update: {},
    create: { nombre, ...extra },
  });
}

async function ensureCine(
  nombre: string,
  direccion: string,
  id_ciudad: bigint,
) {
  const existing = await prisma.cines.findFirst({
    where: { nombre, id_ciudad },
    select: { id: true },
  });
  if (existing) return existing;
  return prisma.cines.create({
    data: { nombre, direccion, id_ciudad },
    select: { id: true },
  });
}

async function ensureSala(
  nombre: string,
  id_cine: bigint,
  filas: number,
  columnas: number,
) {
  const existing = await prisma.salas.findFirst({
    where: { nombre, id_cine },
    select: { id: true },
  });
  if (existing) return existing;
  return prisma.salas.create({
    data: { nombre, id_cine, filas, columnas },
    select: { id: true },
  });
}

async function ensurePelicula(
  titulo: string,
  data: {
    sinopsis: string;
    id_idioma: bigint;
    id_genero: bigint;
    fecha_estreno: Date;
    id_usuario: bigint;
    poster_url?: string;
  },
) {
  const existing = await prisma.peliculas.findFirst({
    where: { titulo },
    select: { id: true },
  });
  if (existing) return existing;
  return prisma.peliculas.create({
    data: { titulo, ...data },
    select: { id: true },
  });
}

async function main() {
  const rolesNames = ['admin', 'cliente', 'empleado', 'gerente'];
  const roles: Record<string, { id: bigint }> = {};
  for (const nombre of rolesNames) {
    roles[nombre] = await upsertByNombre(prisma.roles, nombre);
  }

  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.usuarios.upsert({
    where: { email: 'admin@cinema.com' },
    update: {},
    create: {
      nombre: 'Admin Cinema',
      email: 'admin@cinema.com',
      password_hash: passwordHash,
      telefono: '+502 5555-0001',
      id_rol: roles.admin.id,
      estado: 'activo',
    },
  });

  const cliente = await prisma.usuarios.upsert({
    where: { email: 'cliente@cinema.com' },
    update: {},
    create: {
      nombre: 'Juan Pérez',
      email: 'cliente@cinema.com',
      password_hash: passwordHash,
      telefono: '+502 5555-0002',
      id_rol: roles.cliente.id,
      estado: 'activo',
    },
  });

  const empleado = await prisma.usuarios.upsert({
    where: { email: 'empleado@cinema.com' },
    update: {},
    create: {
      nombre: 'María López',
      email: 'empleado@cinema.com',
      password_hash: passwordHash,
      telefono: '+502 5555-0003',
      id_rol: roles.empleado.id,
      estado: 'activo',
    },
  });

  const ciudadesNames = [
    'Guatemala',
    'San Pedro Sula',
    'Tegucigalpa',
    'Santa Ana',
    'San Salvador',
    'El Progreso',
    'Choloma',
  ];
  const ciudades: Record<string, { id: bigint }> = {};
  for (const nombre of ciudadesNames) {
    ciudades[nombre] = await upsertByNombre(prisma.ciudades, nombre);
  }

  const idiomasNames = ['Español', 'Inglés', 'Francés', 'Japonés', 'Coreano'];
  const idiomas: Record<string, { id: bigint }> = {};
  for (const nombre of idiomasNames) {
    idiomas[nombre] = await upsertByNombre(prisma.idiomas, nombre);
  }

  const generosNames = [
    'Acción',
    'Aventura',
    'Animación',
    'Ciencia Ficción',
    'Comedia',
    'Documental',
    'Drama',
    'Romance',
    'Terror',
  ];
  const generos: Record<string, { id: bigint }> = {};
  for (const nombre of generosNames) {
    generos[nombre] = await upsertByNombre(prisma.generos, nombre);
  }

  const cinepolisGT = await ensureCine(
    'Cinepolis Guatemala',
    'Zona 10, Guatemala',
    ciudades['Guatemala'].id,
  );

  const cinemarkSPS = await ensureCine(
    'Cinemark San Pedro Sula',
    'Mall Multiplaza, San Pedro Sula',
    ciudades['San Pedro Sula'].id,
  );

  const cinemarkTGU = await ensureCine(
    'Cinemark Tegucigalpa',
    'Mall Multiplaza, Tegucigalpa',
    ciudades['Tegucigalpa'].id,
  );

  const cinepolisSA = await ensureCine(
    'Cinepolis Santa Ana',
    'Centro Comercial Santa Ana, Santa Ana',
    ciudades['Santa Ana'].id,
  );

  const cinemarkSS = await ensureCine(
    'Cinemark San Salvador',
    'Centro Comercial La Gran Vía, San Salvador',
    ciudades['San Salvador'].id,
  );

  const cinemarkProgreso = await ensureCine(
    'Cinemark El Progreso',
    'Centro Comercial El Progreso, El Progreso',
    ciudades['El Progreso'].id,
  );

  const cinemarkCholoma = await ensureCine(
    'Cinemark Choloma',
    'Centro Comercial Las Brisas, Choloma',
    ciudades['Choloma'].id,
  );

  await ensureSala('Sala 1', cinepolisGT.id, 10, 14);
  await ensureSala('Sala 2 IMAX', cinepolisGT.id, 12, 18);
  await ensureSala('Sala 1', cinemarkSPS.id, 8, 12);
  await ensureSala('Sala 2', cinemarkTGU.id, 8, 12);
  await ensureSala('Sala 1', cinemarkProgreso.id, 6, 10);
  await ensureSala('Sala 2', cinemarkCholoma.id, 8, 12);
  await ensureSala('Sala 1', cinepolisSA.id, 10, 14);
  await ensureSala('Sala 1', cinemarkSS.id, 10, 14);

  await ensurePelicula('Dune: Part Two', {
    sinopsis: 'Paul Atreides se une a los Fremen para vengar a su familia.',
    id_idioma: idiomas['Inglés'].id,
    id_genero: generos['Ciencia Ficción'].id,
    fecha_estreno: new Date('2026-03-01'),
    id_usuario: admin.id,
  });
  await ensurePelicula('Inside Out 2', {
    sinopsis: 'Riley enfrenta nuevas emociones en su adolescencia.',
    id_idioma: idiomas['Español'].id,
    id_genero: generos['Animación'].id,
    fecha_estreno: new Date('2026-06-14'),
    id_usuario: admin.id,
  });
  await ensurePelicula('La Sociedad de la Nieve', {
    sinopsis:
      'La historia real de los supervivientes del vuelo 571 en los Andes.',
    id_idioma: idiomas['Español'].id,
    id_genero: generos['Drama'].id,
    fecha_estreno: new Date('2026-01-04'),
    id_usuario: admin.id,
  });
  await ensurePelicula('Godzilla x Kong', {
    sinopsis: 'Los dos titanes se enfrentan a una nueva amenaza colosal.',
    id_idioma: idiomas['Inglés'].id,
    id_genero: generos['Acción'].id,
    fecha_estreno: new Date('2026-03-29'),
    id_usuario: admin.id,
  });
  await ensurePelicula('Parásitos', {
    sinopsis: 'Una familia pobre se infiltra en la vida de una familia rica.',
    id_idioma: idiomas['Coreano'].id,
    id_genero: generos['Drama'].id,
    fecha_estreno: new Date('2026-02-15'),
    id_usuario: admin.id,
  });
  await ensurePelicula('El Reino del Planeta de los Simios', {
    sinopsis: 'Generaciones después de César, un nuevo líder simio emerge.',
    id_idioma: idiomas['Inglés'].id,
    id_genero: generos['Aventura'].id,
    fecha_estreno: new Date('2026-05-10'),
    id_usuario: admin.id,
  });

  console.log('Seed completado:');
  console.log(`  Roles:     ${rolesNames.join(', ')}`);
  console.log(`  Ciudades:  ${ciudadesNames.length}`);
  console.log(`  Idiomas:   ${idiomasNames.length}`);
  console.log(`  Géneros:   ${generosNames.length}`);
  console.log(
    `  Cines:     7 (Cinepolis Santa Ana, Cinemark San Pedro Sula, Cinemark Tegucigalpa, Cinemark El Progreso, Cinemark Choloma, Cinepolis Santa Ana, Cinemark San Salvador)`,
  );
  console.log(`  Salas:     12 (2 por cine, distintos tamaños)`);
  console.log(`  Películas: 6`);
  console.log(`  Usuario:   ${admin.email} | password: password123`);
  console.log(`  Usuario:   ${cliente.email} | password: password123`);
  console.log(`  Usuario:   ${empleado.email} | password: password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
