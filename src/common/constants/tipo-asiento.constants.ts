/**
 * Nombre del tipo de asiento reservado para asientos deshabilitados
 * (mal estado, etc.). Los asientos con este tipo se excluyen al generar
 * funciones, no aparecen en el mapa y no se pueden bloquear/vender.
 * La comparación se hace en minúsculas y sin espacios extremos.
 */
export const TIPO_FUERA_DE_SERVICIO = 'fuera de servicio';

/** ¿El nombre de tipo corresponde a "fuera de servicio"? */
export function esTipoFueraDeServicio(nombre: string | null | undefined): boolean {
  return (nombre ?? '').trim().toLowerCase() === TIPO_FUERA_DE_SERVICIO;
}
