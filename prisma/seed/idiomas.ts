import { prisma } from './client';
import { upsertByNombre } from './helpers';

const IDIOMAS = [
  'Español',
  'Inglés',
  'Francés',
  'Japonés',
  'Coreano',
  'Italiano',
  'Alemán',
  'Portugués',
  'Mandarín',
  'Hindi',
];

export type IdiomasMap = Record<string, { id: bigint }>;

export async function seedIdiomas(): Promise<IdiomasMap> {
  const map: IdiomasMap = {};
  for (const nombre of IDIOMAS) {
    map[nombre] = await upsertByNombre(prisma.idiomas, nombre);
  }
  return map;
}
