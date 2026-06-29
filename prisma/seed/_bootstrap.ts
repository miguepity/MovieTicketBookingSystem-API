import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import type { RolesMap } from './roles';
import type { CiudadesMap } from './ciudades';
import type { IdiomasMap } from './idiomas';
import type { GenerosMap } from './generos';
import type { TiposAsientoMap } from './tipos-asiento';
import type { CuponesMap } from './cupones';
import type { UsuariosMap } from './usuarios';
import type { CinesMap } from './cines';
import type { SalasMap, SalaSeed } from './salas';
import type { AsientosMap, AsientoSeed } from './asientos';
import type { PeliculasMap } from './peliculas';
import type { FuncionesMap } from './funciones';
import type { AsientosFuncionMap } from './asientos-funcion';
import type { ReservasMap } from './reservas';
import type { PagosMap } from './pagos';

export function createPrisma(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
}

export const prisma = createPrisma();

export async function runSeed(
  name: string,
  work: (prisma: PrismaClient) => Promise<void>,
): Promise<void> {
  const start = Date.now();
  console.log(`▶ Iniciando seed de ${name}...`);
  try {
    await work(prisma);
    console.log(
      `✓ ${name} completado en ${((Date.now() - start) / 1000).toFixed(2)}s`,
    );
  } catch (err) {
    console.error(`✗ ${name} falló:`, err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

function missing(entidad: string, prereq: string): never {
  throw new Error(
    `No se encontró ${entidad} en la BD.\nCorre primero: npm run seed:${prereq}`,
  );
}

export async function loadRoles(p: PrismaClient): Promise<RolesMap> {
  const rows = await p.roles.findMany({ select: { id: true, nombre: true } });
  if (rows.length === 0) missing('roles', 'roles');
  const map: RolesMap = {};
  for (const r of rows) map[r.nombre] = { id: r.id };
  return map;
}

export async function loadCiudades(p: PrismaClient): Promise<CiudadesMap> {
  const rows = await p.ciudades.findMany({
    select: { id: true, nombre: true },
  });
  if (rows.length === 0) missing('ciudades', 'ciudades');
  const map: CiudadesMap = {};
  for (const r of rows) map[r.nombre] = { id: r.id };
  return map;
}

export async function loadIdiomas(p: PrismaClient): Promise<IdiomasMap> {
  const rows = await p.idiomas.findMany({ select: { id: true, nombre: true } });
  if (rows.length === 0) missing('idiomas', 'idiomas');
  const map: IdiomasMap = {};
  for (const r of rows) map[r.nombre] = { id: r.id };
  return map;
}

export async function loadGeneros(p: PrismaClient): Promise<GenerosMap> {
  const rows = await p.generos.findMany({ select: { id: true, nombre: true } });
  if (rows.length === 0) missing('géneros', 'generos');
  const map: GenerosMap = {};
  for (const r of rows) map[r.nombre] = { id: r.id };
  return map;
}

export async function loadTiposAsiento(
  p: PrismaClient,
): Promise<TiposAsientoMap> {
  const all = await p.tiposAsiento.findMany({
    select: { id: true, nombre: true },
  });
  if (all.length === 0) missing('tipos de asiento', 'tipos-asiento');
  const byNombre: Record<string, { id: bigint }> = {};
  for (const t of all) byNombre[t.nombre] = { id: t.id };
  return { byNombre, all };
}

export async function loadCupones(p: PrismaClient): Promise<CuponesMap> {
  const all = await p.cupones.findMany({
    select: { id: true, codigo: true },
  });
  if (all.length === 0) missing('cupones', 'cupones');
  return { all };
}

export async function loadUsuarios(p: PrismaClient): Promise<UsuariosMap> {
  const all = await p.usuarios.findMany({
    select: { id: true, email: true },
  });
  if (all.length === 0) missing('usuarios', 'usuarios');
  const admin = all.find((u) => u.email === 'admin@cinema.com');
  const cliente = all.find((u) => u.email === 'cliente@cinema.com');
  if (!admin) missing('usuario admin (admin@cinema.com)', 'usuarios');
  if (!cliente) missing('usuario cliente (cliente@cinema.com)', 'usuarios');
  const clientes = all.filter(
    (u) => u.email === 'cliente@cinema.com' || u.email.startsWith('votante'),
  );
  return {
    admin: { id: admin.id },
    cliente: { id: cliente.id },
    clientes,
    all,
  };
}

export async function loadCines(p: PrismaClient): Promise<CinesMap> {
  const all = await p.cines.findMany({
    select: { id: true, nombre: true },
  });
  if (all.length === 0) missing('cines', 'cines');
  const byNombre: Record<string, { id: bigint }> = {};
  for (const c of all) byNombre[c.nombre] = { id: c.id };
  return { byNombre, all };
}

export async function loadSalas(p: PrismaClient): Promise<SalasMap> {
  const all = await p.salas.findMany({
    select: {
      id: true,
      nombre: true,
      id_cine: true,
      filas: true,
      columnas: true,
    },
  });
  if (all.length === 0) missing('salas', 'salas');
  return { all };
}

export async function loadAsientos(p: PrismaClient): Promise<AsientosMap> {
  const rows = await p.asientos.findMany({
    select: { id: true, id_sala: true, fila: true, columna: true },
  });
  if (rows.length === 0) missing('asientos', 'asientos');
  const bySala: Record<string, AsientoSeed[]> = {};
  for (const a of rows) {
    const key = a.id_sala.toString();
    (bySala[key] ??= []).push(a);
  }
  return { bySala };
}

export async function loadPeliculas(p: PrismaClient): Promise<PeliculasMap> {
  const all = await p.peliculas.findMany({
    select: { id: true, titulo: true },
  });
  if (all.length === 0) missing('películas', 'peliculas');
  return { all };
}

export async function loadFunciones(p: PrismaClient): Promise<FuncionesMap> {
  const all = await p.funciones.findMany({
    select: {
      id: true,
      id_pelicula: true,
      id_sala: true,
      fecha_hora: true,
    },
  });
  if (all.length === 0) missing('funciones', 'funciones');
  return { all };
}

export async function loadAsientosFuncion(
  p: PrismaClient,
): Promise<AsientosFuncionMap> {
  const all = await p.asientosFuncion.findMany({
    select: { id: true, id_funcion: true, id_asiento: true, estado: true },
  });
  if (all.length === 0) missing('asientos por función', 'asientos-funcion');
  return { all };
}

export async function loadReservas(p: PrismaClient): Promise<ReservasMap> {
  const all = await p.reservas.findMany({
    select: {
      id: true,
      numero_reserva: true,
      id_funcion: true,
      estado: true,
    },
  });
  if (all.length === 0) missing('reservas', 'reservas');
  return { all };
}

export async function loadPagos(p: PrismaClient): Promise<PagosMap> {
  const rows = await p.pagos.findMany({
    select: {
      id: true,
      id_reserva: true,
      monto_final: true,
      estado: true,
    },
  });
  if (rows.length === 0) missing('pagos', 'pagos');
  return {
    all: rows.map((r) => ({
      id: r.id,
      id_reserva: r.id_reserva,
      monto_final: Number(r.monto_final.toString()),
      estado: r.estado,
    })),
  };
}

export type { SalaSeed, AsientoSeed };
