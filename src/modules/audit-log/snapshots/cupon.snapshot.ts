export type CuponSnapshot = {
  codigo: string;
  tipo: string;
  valor: string;
  fecha_expiracion: string;
  usos_maximos: number | null;
  activo: boolean;
};

type CuponInput = {
  codigo: string;
  tipo: string;
  valor: { toString(): string };
  fecha_expiracion: Date;
  usos_maximos: number | null;
  activo: boolean;
};

export function snapshotCupon(c: CuponInput): CuponSnapshot {
  return {
    codigo: c.codigo,
    tipo: c.tipo,
    valor: c.valor.toString(),
    fecha_expiracion: c.fecha_expiracion.toISOString().slice(0, 10),
    usos_maximos: c.usos_maximos,
    activo: c.activo,
  };
}
