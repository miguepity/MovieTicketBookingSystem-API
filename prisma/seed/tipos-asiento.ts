import { prisma, runSeed } from './_bootstrap';

const TIPOS: ReadonlyArray<{ nombre: string; color: string }> = [
  { nombre: 'general', color: '#3B82F6' },
  { nombre: 'preferencial', color: '#F59E0B' },
];

export interface TiposAsientoMap {
  byNombre: Record<string, { id: bigint }>;
  all: { id: bigint; nombre: string }[];
}

export async function seedTiposAsiento(): Promise<TiposAsientoMap> {
  const byNombre: Record<string, { id: bigint }> = {};
  const all: { id: bigint; nombre: string }[] = [];

  for (const { nombre, color } of TIPOS) {
    const tipo = await prisma.tiposAsiento.upsert({
      where: { nombre },
      update: { color },
      create: { nombre, color },
      select: { id: true, nombre: true },
    });
    byNombre[nombre] = { id: tipo.id };
    all.push(tipo);
  }

  return { byNombre, all };
}

if (require.main === module) {
  void runSeed('tipos-asiento', async () => {
    await seedTiposAsiento();
  });
}
