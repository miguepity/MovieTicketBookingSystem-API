import { Generos } from '../../../../generated/prisma/client';

export type GeneroSnapshot = { nombre: string };

export function snapshotGenero(g: Pick<Generos, 'nombre'>): GeneroSnapshot {
  return { nombre: g.nombre };
}
