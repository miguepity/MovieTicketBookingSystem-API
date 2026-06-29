import { ApiProperty } from '@nestjs/swagger';

// ──── Shape returned by ReservasService.crear() ───────────────────────────────
// {
//   id_reserva, numero_reserva, estado,
//   asientos: [{ codigo, tipo }],
//   total_estimado
// }

export class ReservaCreatedAsientoDto {
  @ApiProperty({ type: String, example: 'A12' })
  codigo!: string;

  @ApiProperty({ type: String, example: 'VIP' })
  tipo!: string;
}

export class ReservaCreatedResponseDto {
  @ApiProperty({ type: String, example: '42' })
  id_reserva!: string;

  @ApiProperty({ type: String, example: 'RES-20260625-ABCDE' })
  numero_reserva!: string;

  @ApiProperty({ type: String, example: 'pendiente_pago' })
  estado!: string;

  @ApiProperty({ type: () => ReservaCreatedAsientoDto, isArray: true })
  asientos!: ReservaCreatedAsientoDto[];

  @ApiProperty({ type: String, example: '25.00' })
  total_estimado!: string;

  @ApiProperty({
    format: 'date-time',
    description: 'Fecha y hora límite para completar el pago (ISO 8601)',
    example: '2026-06-28T15:30:00.000Z',
  })
  expira_en!: string;
}
