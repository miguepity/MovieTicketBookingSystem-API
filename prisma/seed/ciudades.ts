import { prisma, runSeed } from './_bootstrap';
import { upsertByNombre } from './helpers';

const CIUDADES = [
  'Guatemala',
  'San Pedro Sula',
  'Tegucigalpa',
  'Santa Ana',
  'San Salvador',
  'El Progreso',
  'Choloma',
  'Quetzaltenango',
  'La Ceiba',
  'Comayagua',
];

export type CiudadesMap = Record<string, { id: bigint }>;

export async function seedCiudades(): Promise<CiudadesMap> {
  const map: CiudadesMap = {};
  for (const nombre of CIUDADES) {
    map[nombre] = await upsertByNombre(prisma.ciudades, nombre);
  }
  return map;
}

if (require.main === module) {
  void runSeed('ciudades', async () => {
    await seedCiudades();
  });
}
