import { ApiProperty } from '@nestjs/swagger';

export class ReporteReservasDto {
  @ApiProperty({
    description: 'ID de la reserva',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Número de reserva legible',
    example: 'RES-20260625-0001',
  })
  numeroReserva!: string;
}
