import { ApiProperty } from '@nestjs/swagger';

export class BloquearAsientosResponseDto {
  @ApiProperty({
    type: [String],
    description: 'IDs de los asientos-función que fueron bloqueados',
    example: ['12', '13'],
  })
  bloqueados!: string[];

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Timestamp hasta el que los asientos permanecerán bloqueados (ISO 8601)',
    example: '2026-06-25T14:20:00.000Z',
  })
  bloqueado_hasta!: string;
}
