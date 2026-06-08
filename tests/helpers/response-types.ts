export interface MapaAsientoDto {
  id_asiento_funcion: string;
  fila: string;
  columna: number;
  codigo: string;
  tipo: string;
  estado: string;
  es_mio: boolean;
}

export interface MapaResponse {
  funcion_id: string;
  sala: { filas: number; columnas: number };
  asientos: MapaAsientoDto[];
}

export interface BloquearResponse {
  bloqueados: string[];
  bloqueado_hasta: string;
}

export interface ReservaResponse {
  id_reserva: string;
  numero_reserva: string;
  estado: string;
  asientos: { codigo: string; tipo: string }[];
  total_estimado: string;
}

export interface PagoResponse {
  id_pago: string;
  estado: string;
  monto_original: string;
  monto_descuento: string;
  monto_final: string;
  numero_reserva: string;
}

export interface CancelarReservaResponse {
  id_reserva: string;
  estado: string;
  monto_reembolso: string;
  id_reembolso: string | null;
  fecha_cancelacion: string;
}

export interface ReembolsoResponse {
  id_reembolso: string;
  monto: string;
  estado: string;
  fecha_procesado: string | null;
}

export interface ErrorResponse {
  code?: string;
  message?: string | { code?: string; message?: string };
  ids?: string[];
  statusCode?: number;
}

export function errorCode(body: ErrorResponse): string | undefined {
  if (typeof body.message === 'object' && body.message !== null) {
    return body.message.code;
  }
  return body.code;
}
