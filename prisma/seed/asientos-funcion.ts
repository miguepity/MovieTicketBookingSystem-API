import { prisma, runSeed, loadAsientos, loadFunciones } from './_bootstrap';
import type { AsientosMap } from './asientos';
import type { FuncionesMap } from './funciones';

export interface AsientoFuncionSeed {
  id: bigint;
  id_funcion: bigint;
  id_asiento: bigint;
  estado: string;
}

export interface AsientosFuncionMap {
  all: AsientoFuncionSeed[];
}

export async function seedAsientosFuncion(
  asientos: AsientosMap,
  funciones: FuncionesMap,
): Promise<AsientosFuncionMap> {
  const all: AsientoFuncionSeed[] = [];

  for (const funcion of funciones.all) {
    const asientosSala = asientos.bySala[funcion.id_sala.toString()] ?? [];
    if (asientosSala.length === 0) continue;

    const existingCount = await prisma.asientosFuncion.count({
      where: { id_funcion: funcion.id },
    });

    if (existingCount === 0) {
      await prisma.asientosFuncion.createMany({
        data: asientosSala.map((a) => ({
          id_asiento: a.id,
          id_funcion: funcion.id,
          estado: 'disponible',
          version: 1,
        })),
      });
    }

    const rows = await prisma.asientosFuncion.findMany({
      where: { id_funcion: funcion.id },
      select: {
        id: true,
        id_funcion: true,
        id_asiento: true,
        estado: true,
      },
    });
    all.push(...rows);
  }

  return { all };
}

if (require.main === module) {
  void runSeed('asientos-funcion', async (p) => {
    const asientos = await loadAsientos(p);
    const funciones = await loadFunciones(p);
    await seedAsientosFuncion(asientos, funciones);
  });
}
