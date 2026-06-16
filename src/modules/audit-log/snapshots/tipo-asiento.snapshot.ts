import { TiposAsiento } from '../../../../generated/prisma/client';

export type TipoAsientoSnapshot = { nombre: string };

export function snapshotTipoAsiento(t: Pick<TiposAsiento, 'nombre'>): TipoAsientoSnapshot {
  return { nombre: t.nombre };
}
