export type SalaSnapshot = {
  nombre: string;
  id_cine: string;
  cine_nombre: string;
  filas: number;
  columnas: number;
  capacidad: number;
};

type SalaInput = {
  nombre: string;
  id_cine: bigint;
  filas: number;
  columnas: number;
  cines: { nombre: string };
};

export function snapshotSala(s: SalaInput): SalaSnapshot {
  return {
    nombre: s.nombre,
    id_cine: s.id_cine.toString(),
    cine_nombre: s.cines.nombre,
    filas: s.filas,
    columnas: s.columnas,
    capacidad: s.filas * s.columnas,
  };
}
