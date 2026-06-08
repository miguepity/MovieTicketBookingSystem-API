import { prisma } from './client';
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
  let count = 0;
  for (const cine of cines.all) {
    for (const tipo of tipos.all) {
      const precio = PRECIO_POR_TIPO[tipo.nombre] ?? PRECIO_DEFAULT;
      await prisma.preciosCine.upsert({
        where: {
          id_cine_id_tipo_asiento: {
            id_cine: cine.id,
            id_tipo_asiento: tipo.id,
          },
        },
        update: {},
        create: {
          id_cine: cine.id,
          id_tipo_asiento: tipo.id,
          precio,
        },
      });
      count++;
    }
  }
  return count;
}
