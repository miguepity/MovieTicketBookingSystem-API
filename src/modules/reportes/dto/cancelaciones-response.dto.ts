import { ApiProperty } from '@nestjs/swagger';

export class CancelacionesPorPoliticaDto {
  @ApiProperty({ type: String, description: 'Nombre de la política de cancelación', example: 'Política estándar' })
  nombre!: string;

  @ApiProperty({ type: Number, description: 'Número de cancelaciones con esta política', example: 8 })
  count!: number;
}

export class CancelacionesPorCineDto {
  @ApiProperty({ type: String, description: 'Nombre del cine', example: 'Cineplex Central' })
  nombre!: string;

  @ApiProperty({ type: Number, description: 'Número de cancelaciones en este cine', example: 7 })
  count!: number;
}

export class CancelacionesTendenciaDto {
  @ApiProperty({ type: String, format: 'date', description: 'Fecha (YYYY-MM-DD)', example: '2026-06-01' })
  fecha!: string;

  @ApiProperty({ type: Number, description: 'Número de cancelaciones en esa fecha', example: 2 })
  count!: number;
}

export class CancelacionesResponseDto {
  @ApiProperty({ type: Number, description: 'Total de reservas canceladas', example: 12 })
  total_canceladas!: number;

  @ApiProperty({ type: Number, description: 'Tasa de cancelación (0–1)', example: 0.15 })
  tasa!: number;

  @ApiProperty({
    type: () => CancelacionesPorPoliticaDto,
    isArray: true,
    description: 'Distribución de cancelaciones por política de cancelación',
  })
  por_politica!: CancelacionesPorPoliticaDto[];

  @ApiProperty({
    type: () => CancelacionesPorCineDto,
    isArray: true,
    description: 'Distribución de cancelaciones por cine',
  })
  por_cine!: CancelacionesPorCineDto[];

  @ApiProperty({
    type: () => CancelacionesTendenciaDto,
    isArray: true,
    description: 'Tendencia de cancelaciones de los últimos 30 días',
  })
  tendencia_30d!: CancelacionesTendenciaDto[];
}
