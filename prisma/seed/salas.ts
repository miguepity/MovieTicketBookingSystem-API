import { prisma } from './client';
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
  const all: SalaSeed[] = [];

  for (const [nombre, cineNombre, filas, columnas] of SALAS) {
    const id_cine = cines.byNombre[cineNombre].id;
    const existing = await prisma.salas.findFirst({
      where: { nombre, id_cine },
      select: {
        id: true,
        nombre: true,
        id_cine: true,
        filas: true,
        columnas: true,
      },
    });
    const sala =
      existing ??
      (await prisma.salas.create({
        data: { nombre, id_cine, filas, columnas },
        select: {
          id: true,
          nombre: true,
          id_cine: true,
          filas: true,
          columnas: true,
        },
      }));
    all.push(sala);
  }

  return { all };
}
