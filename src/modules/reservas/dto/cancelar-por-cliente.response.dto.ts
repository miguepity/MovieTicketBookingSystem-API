import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ──── Shape returned by ReservasService.cancelarPorCliente() ──────────────────
// {
//   reserva: { id_reserva, numero_reserva, estado, fecha_cancelacion },
//   reembolso: { id_reembolso, estado, monto } | null
// }

export class CancelarPorClienteReservaDto {
  @ApiProperty({ type: String, example: '42' })
  id_reserva!: string;

  @ApiProperty({ type: String, example: 'RES-20260625-ABCDE' })
  numero_reserva!: string;

  @ApiProperty({ type: String, example: 'cancelada' })
  estado!: string;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-25T14:30:00.000Z' })
  fecha_cancelacion!: string;
}

export class CancelarPorClienteReembolsoDto {
  @ApiProperty({ type: String, example: '7' })
  id_reembolso!: string;

  @ApiProperty({ type: String, example: 'PENDIENTE' })
  estado!: string;

  @ApiProperty({ type: String, example: '12.50' })
  monto!: string;
}

export class CancelarPorClienteResponseDto {
  @ApiProperty({ type: () => CancelarPorClienteReservaDto })
  reserva!: CancelarPorClienteReservaDto;

  @ApiPropertyOptional({ type: () => CancelarPorClienteReembolsoDto, nullable: true })
  reembolso!: CancelarPorClienteReembolsoDto | null;
}
