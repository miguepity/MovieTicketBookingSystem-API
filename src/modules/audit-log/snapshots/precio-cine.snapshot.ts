export type PrecioCineSnapshot = {
  cine_nombre: string;
  tipo_asiento_nombre: string;
  precio: string;
};

type PrecioCineInput = {
  precio: { toString(): string };
  cines: { nombre: string };
  tipoAsiento: { nombre: string };
};

export function snapshotPrecioCine(p: PrecioCineInput): PrecioCineSnapshot {
  return {
    cine_nombre: p.cines.nombre,
    tipo_asiento_nombre: p.tipoAsiento.nombre,
    precio: p.precio.toString(),
  };
}
