export type PrecioCineSnapshot = {
  cine_nombre: string;
  tipo_asiento_nombre: string;
  precio: string;
};

type PrecioCineInput = {
  precio: { toString(): string };
  cine?: { nombre: string } | null;
  tipo_asiento: { nombre: string };
};

export function snapshotPrecioCine(p: PrecioCineInput): PrecioCineSnapshot {
  return {
    cine_nombre: p.cine?.nombre ?? '',
    tipo_asiento_nombre: p.tipo_asiento.nombre,
    precio: p.precio.toString(),
  };
}
