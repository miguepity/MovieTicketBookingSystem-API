import { prisma } from './client';

const TIPOS: ReadonlyArray<string> = ['general', 'preferencial'];

export interface TiposAsientoMap {
  byNombre: Record<string, { id: bigint }>;
  all: { id: bigint; nombre: string }[];
}

export async function seedTiposAsiento(): Promise<TiposAsientoMap> {
  const byNombre: Record<string, { id: bigint }> = {};
  const all: { id: bigint; nombre: string }[] = [];

  for (const nombre of TIPOS) {
    const tipo = await prisma.tiposAsiento.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
      select: { id: true, nombre: true },
    });
    byNombre[nombre] = { id: tipo.id };
    all.push(tipo);
  }

  return { byNombre, all };
}
