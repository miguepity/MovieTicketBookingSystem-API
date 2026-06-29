import { prisma, runSeed, loadSalas, loadTiposAsiento } from './_bootstrap';
import type { SalasMap } from './salas';
import type { TiposAsientoMap } from './tipos-asiento';

export interface AsientoSeed {
  id: bigint;
  id_sala: bigint;
  fila: string;
  columna: number;
}

export interface AsientosMap {
  bySala: Record<string, AsientoSeed[]>;
}

export async function seedAsientos(
  salas: SalasMap,
  tipos: TiposAsientoMap,
): Promise<AsientosMap> {
  const bySala: AsientosMap['bySala'] = {};
  const idPreferencial = tipos.byNombre['preferencial'].id;
  const idGeneral = tipos.byNombre['general'].id;

  for (const sala of salas.all) {
    const total = sala.filas * sala.columnas;
    const existing = await prisma.asientos.findMany({
      where: { id_sala: sala.id },
      select: { id: true, id_sala: true, fila: true, columna: true },
    });

    if (existing.length >= total) {
      bySala[sala.id.toString()] = existing;
      continue;
    }

    const data: Array<{
      id_sala: bigint;
      fila: string;
      columna: number;
      codigo: string;
      id_tipo_asiento: bigint;
    }> = [];

    for (let f = 0; f < sala.filas; f++) {
      const fila = String.fromCharCode(65 + f);
      for (let c = 1; c <= sala.columnas; c++) {
        const id_tipo_asiento = f === 0 ? idPreferencial : idGeneral;
        data.push({
          id_sala: sala.id,
          fila,
          columna: c,
          codigo: `${fila}${c}`,
          id_tipo_asiento,
        });
      }
    }

    await prisma.asientos.createMany({ data, skipDuplicates: true });

    bySala[sala.id.toString()] = await prisma.asientos.findMany({
      where: { id_sala: sala.id },
      select: { id: true, id_sala: true, fila: true, columna: true },
    });
  }

  return { bySala };
}

if (require.main === module) {
  void runSeed('asientos', async (p) => {
    const salas = await loadSalas(p);
    const tipos = await loadTiposAsiento(p);
    await seedAsientos(salas, tipos);
  });
}
