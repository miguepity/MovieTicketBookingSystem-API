import { prisma, runSeed } from './_bootstrap';
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

if (require.main === module) {
  void runSeed('idiomas', async () => {
    await seedIdiomas();
  });
}
