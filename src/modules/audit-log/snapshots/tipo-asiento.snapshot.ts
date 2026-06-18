import { TiposAsiento } from '../../../../generated/prisma/client';

export type TipoAsientoSnapshot = { nombre: string; color: string | null };

export function snapshotTipoAsiento(
  t: Pick<TiposAsiento, 'nombre' | 'color'>,
): TipoAsientoSnapshot {
  return { nombre: t.nombre, color: t.color ?? null };
}
