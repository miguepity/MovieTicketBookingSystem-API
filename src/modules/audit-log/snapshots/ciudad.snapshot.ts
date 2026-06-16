import { Ciudades } from '../../../../generated/prisma/client';

export type CiudadSnapshot = { nombre: string };

export function snapshotCiudad(c: Pick<Ciudades, 'nombre'>): CiudadSnapshot {
  return { nombre: c.nombre };
}
