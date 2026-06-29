import { prisma, runSeed } from './_bootstrap';
import { upsertByNombre } from './helpers';

const ROLES = ['admin', 'cliente'];

export type RolesMap = Record<string, { id: bigint }>;

export async function seedRoles(): Promise<RolesMap> {
  const map: RolesMap = {};
  for (const nombre of ROLES) {
    map[nombre] = await upsertByNombre(prisma.roles, nombre);
  }
  return map;
}

if (require.main === module) {
  void runSeed('roles', async () => {
    await seedRoles();
  });
}
