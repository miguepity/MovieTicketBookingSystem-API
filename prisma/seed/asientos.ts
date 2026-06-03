import { prisma } from './client';
import type { SalasMap } from './salas';

export interface AsientoSeed {
  id: bigint;
  id_sala: bigint;
  fila: string;
  columna: number;
}

export interface AsientosMap {
  bySala: Record<string, AsientoSeed[]>;
}

export async function seedAsientos(salas: SalasMap): Promise<AsientosMap> {
  const bySala: AsientosMap['bySala'] = {};

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
      tipo: string;
    }> = [];

    for (let f = 0; f < sala.filas; f++) {
      const fila = String.fromCharCode(65 + f);
      for (let c = 1; c <= sala.columnas; c++) {
        const tipo = f === 0 ? 'preferencial' : 'general';
        data.push({
          id_sala: sala.id,
          fila,
          columna: c,
          codigo: `${fila}${c}`,
          tipo,
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
