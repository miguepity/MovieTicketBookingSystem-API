import { prisma, runSeed, loadCiudades } from './_bootstrap';
import type { CiudadesMap } from './ciudades';

const CINES: ReadonlyArray<readonly [string, string, string]> = [
  ['Cinepolis Guatemala', 'Zona 10, Guatemala', 'Guatemala'],
  ['Cinemark San Pedro Sula', 'Mall Multiplaza, SPS', 'San Pedro Sula'],
  ['Cinemark Tegucigalpa', 'Mall Multiplaza, TGU', 'Tegucigalpa'],
  ['Cinepolis Santa Ana', 'Centro Comercial Santa Ana', 'Santa Ana'],
  ['Cinemark San Salvador', 'Centro Comercial La Gran Vía', 'San Salvador'],
  ['Cinemark El Progreso', 'Centro Comercial El Progreso', 'El Progreso'],
  ['Cinemark Choloma', 'Centro Comercial Las Brisas', 'Choloma'],
  ['Cinepolis Quetzaltenango', 'Centro Comercial Pradera', 'Quetzaltenango'],
  ['Cinemark La Ceiba', 'Mall Megaplaza', 'La Ceiba'],
  ['Cinemark Comayagua', 'Centro Comercial Plaza Sur', 'Comayagua'],
];

export interface CinesMap {
  byNombre: Record<string, { id: bigint }>;
  all: { id: bigint; nombre: string }[];
}

export async function seedCines(ciudades: CiudadesMap): Promise<CinesMap> {
  const candidatos = CINES.map(([nombre, direccion, ciudad]) => ({
    nombre,
    direccion,
    id_ciudad: ciudades[ciudad].id,
  }));

  const key = (n: string, c: bigint) => `${n}|${c}`;
  const where = {
    OR: candidatos.map((c) => ({ nombre: c.nombre, id_ciudad: c.id_ciudad })),
  };

  const existentes = await prisma.cines.findMany({
    where,
    select: { id: true, nombre: true, id_ciudad: true },
  });
  const existentesSet = new Set(
    existentes.map((e) => key(e.nombre, e.id_ciudad)),
  );
  const aCrear = candidatos.filter(
    (c) => !existentesSet.has(key(c.nombre, c.id_ciudad)),
  );
  if (aCrear.length) await prisma.cines.createMany({ data: aCrear });

  const todos = await prisma.cines.findMany({
    where,
    select: { id: true, nombre: true, id_ciudad: true },
  });
  const orden = new Map(
    candidatos.map((c, i) => [key(c.nombre, c.id_ciudad), i]),
  );
  todos.sort(
    (a, b) =>
      (orden.get(key(a.nombre, a.id_ciudad)) ?? 0) -
      (orden.get(key(b.nombre, b.id_ciudad)) ?? 0),
  );

  const byNombre: Record<string, { id: bigint }> = {};
  const all: { id: bigint; nombre: string }[] = [];
  for (const c of todos) {
    byNombre[c.nombre] = { id: c.id };
    all.push({ id: c.id, nombre: c.nombre });
  }
  return { byNombre, all };
}

if (require.main === module) {
  void runSeed('cines', async (p) => {
    const ciudades = await loadCiudades(p);
    await seedCines(ciudades);
  });
}
