import { prisma, runSeed, loadCines } from './_bootstrap';
import type { CinesMap } from './cines';

const SALAS: ReadonlyArray<readonly [string, string, number, number]> = [
  ['Sala 1', 'Cinepolis Guatemala', 10, 14],
  ['Sala 2 IMAX', 'Cinepolis Guatemala', 12, 18],
  ['Sala 1', 'Cinemark San Pedro Sula', 8, 12],
  ['Sala 2', 'Cinemark Tegucigalpa', 8, 12],
  ['Sala 1', 'Cinepolis Santa Ana', 10, 14],
  ['Sala 1', 'Cinemark San Salvador', 10, 14],
  ['Sala 1', 'Cinemark El Progreso', 6, 10],
  ['Sala 2', 'Cinemark Choloma', 8, 12],
  ['Sala 1', 'Cinepolis Quetzaltenango', 10, 14],
  ['Sala 1', 'Cinemark La Ceiba', 8, 12],
  ['Sala 1', 'Cinemark Comayagua', 6, 10],
];

export interface SalaSeed {
  id: bigint;
  nombre: string;
  id_cine: bigint;
  filas: number;
  columnas: number;
}

export interface SalasMap {
  all: SalaSeed[];
}

export async function seedSalas(cines: CinesMap): Promise<SalasMap> {
  const candidatos = SALAS.map(([nombre, cineNombre, filas, columnas]) => ({
    nombre,
    id_cine: cines.byNombre[cineNombre].id,
    filas,
    columnas,
  }));

  const key = (n: string, c: bigint) => `${n}|${c}`;
  const where = {
    OR: candidatos.map((c) => ({ nombre: c.nombre, id_cine: c.id_cine })),
  };
  const select = {
    id: true,
    nombre: true,
    id_cine: true,
    filas: true,
    columnas: true,
  };

  const existentes = await prisma.salas.findMany({ where, select });
  const existentesSet = new Set(
    existentes.map((e) => key(e.nombre, e.id_cine)),
  );
  const aCrear = candidatos.filter(
    (c) => !existentesSet.has(key(c.nombre, c.id_cine)),
  );
  if (aCrear.length) await prisma.salas.createMany({ data: aCrear });

  const todos = await prisma.salas.findMany({ where, select });
  const orden = new Map(
    candidatos.map((c, i) => [key(c.nombre, c.id_cine), i]),
  );
  todos.sort(
    (a, b) =>
      (orden.get(key(a.nombre, a.id_cine)) ?? 0) -
      (orden.get(key(b.nombre, b.id_cine)) ?? 0),
  );

  return { all: todos };
}

if (require.main === module) {
  void runSeed('salas', async (p) => {
    const cines = await loadCines(p);
    await seedSalas(cines);
  });
}
