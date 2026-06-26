import { ApiProperty } from '@nestjs/swagger';

export class CiudadResponseDto {
  @ApiProperty({ description: 'ID de la ciudad', example: '1' })
  id!: string;

  @ApiProperty({ description: 'Nombre de la ciudad', example: 'Guatemala' })
  nombre!: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  created_at!: string;
}
