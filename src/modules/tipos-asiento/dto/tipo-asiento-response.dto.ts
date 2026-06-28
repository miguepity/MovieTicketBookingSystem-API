import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TipoAsientoResponseDto {
  @ApiProperty({ description: 'ID del tipo de asiento', type: String, example: '1' })
  id!: string;

  @ApiProperty({ description: 'Nombre del tipo de asiento', example: 'VIP' })
  nombre!: string;

  @ApiPropertyOptional({
    description: 'Color representativo del tipo de asiento',
    example: '#FFD700',
    nullable: true,
  })
  color!: string | null;

  @ApiPropertyOptional({
    description: 'Número de salas que utilizan este tipo de asiento',
    example: 3,
  })
  salas_usando?: number;

  @ApiPropertyOptional({
    description: 'Total de asientos de este tipo en todas las salas',
    example: 120,
  })
  asientos_total?: number;
}
