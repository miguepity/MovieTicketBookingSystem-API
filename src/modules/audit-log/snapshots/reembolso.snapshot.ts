export type ReembolsoSnapshot = {
  id_pago: string;
  monto: string;
  porcentaje_aplicado: string;
  estado: string;
  id_politica: string | null;
  fecha_procesado: string | null;
};

type ReembolsoInput = {
  id_pago: bigint;
  monto: { toString(): string };
  porcentaje_aplicado: { toString(): string };
  estado: string;
  id_politica: bigint | null;
  fecha_procesado: Date | null;
};

export function snapshotReembolso(r: ReembolsoInput): ReembolsoSnapshot {
  return {
    id_pago: r.id_pago.toString(),
    monto: r.monto.toString(),
    porcentaje_aplicado: r.porcentaje_aplicado.toString(),
    estado: r.estado,
    id_politica: r.id_politica != null ? r.id_politica.toString() : null,
    fecha_procesado: r.fecha_procesado ? r.fecha_procesado.toISOString() : null,
  };
}
