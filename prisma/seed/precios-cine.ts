import { prisma, runSeed, loadCines, loadTiposAsiento } from './_bootstrap';
import type { CinesMap } from './cines';
import type { TiposAsientoMap } from './tipos-asiento';

const PRECIO_POR_TIPO: Record<string, number> = {
  preferencial: 100,
  general: 50,
};

const PRECIO_DEFAULT = 50;

export async function seedPreciosCine(
  cines: CinesMap,
  tipos: TiposAsientoMap,
): Promise<number> {
  const candidatos: {
    id_cine: bigint;
    id_tipo_asiento: bigint;
    precio: number;
  }[] = [];
  for (const cine of cines.all) {
    for (const tipo of tipos.all) {
      candidatos.push({
        id_cine: cine.id,
        id_tipo_asiento: tipo.id,
        precio: PRECIO_POR_TIPO[tipo.nombre] ?? PRECIO_DEFAULT,
      });
    }
  }
  if (candidatos.length === 0) return 0;
  await prisma.preciosCine.createMany({
    data: candidatos,
    skipDuplicates: true,
  });
  return candidatos.length;
}

if (require.main === module) {
  void runSeed('precios-cine', async (p) => {
    const cines = await loadCines(p);
    const tipos = await loadTiposAsiento(p);
    await seedPreciosCine(cines, tipos);
  });
}
