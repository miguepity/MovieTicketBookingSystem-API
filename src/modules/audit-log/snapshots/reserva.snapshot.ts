export type ReservaSnapshot = {
  numero_reserva: string;
  id_usuario: string;
  usuario_nombre: string;
  id_funcion: string;
  funcion_label: string;
  estado: string;
  asientos: string[];
  total: string;
};

type ReservaInput = {
  numero_reserva: string;
  id_usuario: bigint;
  id_funcion: bigint;
  estado: string;
  usuarios: { nombre: string };
  funciones: {
    fecha_hora: Date;
    peliculas: { titulo: string };
    salas: { nombre: string };
  };
  reservaAsientos: Array<{
    asientosfuncion: { asientos: { fila: string; columna: number } };
  }>;
  pagos: Array<{ monto_final: { toString(): string } }>;
};

export function snapshotReserva(r: ReservaInput): ReservaSnapshot {
  const asientos = r.reservaAsientos.map(
    (ra) => `${ra.asientosfuncion.asientos.fila}${ra.asientosfuncion.asientos.columna}`,
  );
  const total = r.pagos
    .reduce((sum, p) => sum + Number(p.monto_final.toString()), 0)
    .toFixed(2);
  return {
    numero_reserva: r.numero_reserva,
    id_usuario: r.id_usuario.toString(),
    usuario_nombre: r.usuarios.nombre,
    id_funcion: r.id_funcion.toString(),
    funcion_label: `${r.funciones.peliculas.titulo} · ${r.funciones.salas.nombre} · ${r.funciones.fecha_hora.toISOString()}`,
    estado: r.estado,
    asientos,
    total,
  };
}
