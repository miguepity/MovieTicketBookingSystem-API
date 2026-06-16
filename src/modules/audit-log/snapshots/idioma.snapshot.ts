import { Idiomas } from '../../../../generated/prisma/client';

export type IdiomaSnapshot = { nombre: string };

export function snapshotIdioma(i: Pick<Idiomas, 'nombre'>): IdiomaSnapshot {
  return { nombre: i.nombre };
}
