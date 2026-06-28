import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ──── Shape returned by ReservasService.cancelar() ────────────────────────────
// {
//   id_reserva, estado, monto_reembolso, id_reembolso, fecha_cancelacion
// }

export class CancelarReservaResponseDto {
  @ApiProperty({ type: String, example: '42' })
  id_reserva!: string;

  @ApiProperty({ type: String, example: 'cancelada' })
  estado!: string;

  @ApiProperty({ type: String, example: '25.00' })
  monto_reembolso!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: '7' })
  id_reembolso!: string | null;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-25T14:30:00.000Z' })
  fecha_cancelacion!: string;
}
