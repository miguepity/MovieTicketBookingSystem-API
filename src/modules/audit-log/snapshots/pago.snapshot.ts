export type PagoSnapshot = {
  id_reserva: string;
  numero_reserva: string;
  monto_original: string;
  monto_descuento: string;
  monto_final: string;
  metodo: string;
  estado: string;
  marca_snapshot: string | null;
  ultimos4_snapshot: string | null;
  referencia_externa: string | null;
  id_cupon: string | null;
};

type PagoInput = {
  id_reserva: bigint;
  monto_original: { toString(): string };
  monto_descuento: { toString(): string };
  monto_final: { toString(): string };
  metodo: string;
  estado: string;
  marca_snapshot: string | null;
  ultimos4_snapshot: string | null;
  referencia_externa: string | null;
  id_cupon: bigint | null;
  reservas: { numero_reserva: string };
};

export function snapshotPago(p: PagoInput): PagoSnapshot {
  return {
    id_reserva: p.id_reserva.toString(),
    numero_reserva: p.reservas.numero_reserva,
    monto_original: p.monto_original.toString(),
    monto_descuento: p.monto_descuento.toString(),
    monto_final: p.monto_final.toString(),
    metodo: p.metodo,
    estado: p.estado,
    marca_snapshot: p.marca_snapshot,
    ultimos4_snapshot: p.ultimos4_snapshot,
    referencia_externa: p.referencia_externa,
    id_cupon: p.id_cupon != null ? p.id_cupon.toString() : null,
  };
}
