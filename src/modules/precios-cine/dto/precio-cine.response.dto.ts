import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CineRefDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ type: String, example: 'Cine Metropolis' })
  nombre!: string;
}

export class TipoAsientoRefDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ type: String, example: 'VIP' })
  nombre!: string;
}

export class PrecioCineResponseDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ type: String, example: '12.50', description: 'Precio formateado como decimal string' })
  precio!: string;

  @ApiPropertyOptional({ type: () => CineRefDto, nullable: true })
  cine!: CineRefDto | null;

  @ApiProperty({ type: () => TipoAsientoRefDto })
  tipo_asiento!: TipoAsientoRefDto;
}

// ──── Matriz ────────────────────────────────────────────────────────────────

export class TipoAsientoMatrizDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ type: String, example: 'VIP' })
  nombre!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: '#FFD700' })
  color!: string | null;
}

export class CineMatrizDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ type: String, example: 'Cine Metropolis' })
  nombre!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Bogotá' })
  ciudad!: string | null;

  @ApiProperty({
    description: 'Map of tipo_asiento id → precio',
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { '1': 12.5, '2': 8.0 },
  })
  precios!: Record<string, number>;
}

export class MatrizPreciosResponseDto {
  @ApiProperty({ type: () => TipoAsientoMatrizDto, isArray: true })
  tipos_asiento!: TipoAsientoMatrizDto[];

  @ApiProperty({
    description: 'Precios globales por defecto: map of tipo_asiento id → precio',
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { '1': 10.0, '2': 7.0 },
  })
  defaults!: Record<string, number>;

  @ApiProperty({ type: () => CineMatrizDto, isArray: true })
  cines!: CineMatrizDto[];
}

// ──── findByCine row ──────────────────────────────────────────────────────────

export class TipoAsientoFullDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ type: String, example: 'VIP' })
  nombre!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: '#FFD700' })
  color!: string | null;
}

export class PrecioCineByCineResponseDto {
  @ApiProperty({ type: String, example: '5' })
  id!: string;

  @ApiProperty({ type: String, example: '2' })
  id_cine!: string;

  @ApiProperty({ type: String, example: '1' })
  id_tipo_asiento!: string;

  @ApiProperty({ type: String, example: '12.50' })
  precio!: string;

  @ApiProperty({ type: () => TipoAsientoFullDto })
  tipo_asiento!: TipoAsientoFullDto;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-01T00:00:00.000Z' })
  created_at!: string;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  updated_at!: string | null;
}
