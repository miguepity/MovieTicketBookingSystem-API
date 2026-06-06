import { prisma } from './client';
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
  const byNombre: Record<string, { id: bigint }> = {};
  const all: { id: bigint; nombre: string }[] = [];

  for (const [nombre, direccion, ciudad] of CINES) {
    const id_ciudad = ciudades[ciudad].id;
    const existing = await prisma.cines.findFirst({
      where: { nombre, id_ciudad },
      select: { id: true, nombre: true },
    });
    const cine =
      existing ??
      (await prisma.cines.create({
        data: { nombre, direccion, id_ciudad },
        select: { id: true, nombre: true },
      }));
    byNombre[nombre] = { id: cine.id };
    all.push(cine);
  }

  return { byNombre, all };
}
