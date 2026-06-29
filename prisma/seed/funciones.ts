import { prisma, runSeed, loadPeliculas, loadSalas } from './_bootstrap';
import type { PeliculasMap } from './peliculas';
import type { SalasMap } from './salas';

export interface FuncionSeed {
  id: bigint;
  id_pelicula: bigint;
  id_sala: bigint;
  fecha_hora: Date;
}

export interface FuncionesMap {
  all: FuncionSeed[];
}

export async function seedFunciones(
  peliculas: PeliculasMap,
  salas: SalasMap,
): Promise<FuncionesMap> {
  const baseDate = new Date();
  baseDate.setUTCDate(baseDate.getUTCDate() + 1);
  baseDate.setUTCHours(15, 0, 0, 0);

  const candidatos: {
    id_pelicula: bigint;
    id_sala: bigint;
    fecha_hora: Date;
  }[] = [];
  for (let i = 0; i < 12; i++) {
    candidatos.push({
      id_pelicula: peliculas.all[i % peliculas.all.length].id,
      id_sala: salas.all[i % salas.all.length].id,
      fecha_hora: new Date(baseDate.getTime() + i * 3 * 3600 * 1000),
    });
  }

  const key = (p: bigint, s: bigint, t: Date) => `${p}|${s}|${t.toISOString()}`;
  const where = {
    OR: candidatos.map((c) => ({
      id_pelicula: c.id_pelicula,
      id_sala: c.id_sala,
      fecha_hora: c.fecha_hora,
    })),
  };
  const select = {
    id: true,
    id_pelicula: true,
    id_sala: true,
    fecha_hora: true,
  };

  const existentes = await prisma.funciones.findMany({ where, select });
  const existentesSet = new Set(
    existentes.map((e) => key(e.id_pelicula, e.id_sala, e.fecha_hora)),
  );
  const aCrear = candidatos.filter(
    (c) => !existentesSet.has(key(c.id_pelicula, c.id_sala, c.fecha_hora)),
  );
  if (aCrear.length) {
    await prisma.funciones.createMany({
      data: aCrear.map((c) => ({ ...c, estado: 'programada' as const })),
    });
  }

  const todos = await prisma.funciones.findMany({ where, select });
  const orden = new Map(
    candidatos.map((c, i) => [key(c.id_pelicula, c.id_sala, c.fecha_hora), i]),
  );
  todos.sort(
    (a, b) =>
      (orden.get(key(a.id_pelicula, a.id_sala, a.fecha_hora)) ?? 0) -
      (orden.get(key(b.id_pelicula, b.id_sala, b.fecha_hora)) ?? 0),
  );

  return { all: todos };
}

if (require.main === module) {
  void runSeed('funciones', async (p) => {
    const peliculas = await loadPeliculas(p);
    const salas = await loadSalas(p);
    await seedFunciones(peliculas, salas);
  });
}
