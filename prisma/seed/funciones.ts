import { prisma } from './client';
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
  const all: FuncionSeed[] = [];
  const baseDate = new Date();
  baseDate.setUTCDate(baseDate.getUTCDate() + 1);
  baseDate.setUTCHours(15, 0, 0, 0);

  for (let i = 0; i < 12; i++) {
    const pelicula = peliculas.all[i % peliculas.all.length];
    const sala = salas.all[i % salas.all.length];
    const fecha_hora = new Date(baseDate.getTime() + i * 3 * 3600 * 1000);

    const existing = await prisma.funciones.findFirst({
      where: { id_pelicula: pelicula.id, id_sala: sala.id, fecha_hora },
      select: {
        id: true,
        id_pelicula: true,
        id_sala: true,
        fecha_hora: true,
      },
    });
    const funcion =
      existing ??
      (await prisma.funciones.create({
        data: {
          id_pelicula: pelicula.id,
          id_sala: sala.id,
          fecha_hora,
          estado: 'programada',
        },
        select: {
          id: true,
          id_pelicula: true,
          id_sala: true,
          fecha_hora: true,
        },
      }));
    all.push(funcion);
  }

  return { all };
}
