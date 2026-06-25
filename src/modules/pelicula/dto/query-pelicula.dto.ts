import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryPeliculaDto {
  @ApiPropertyOptional({
    description: 'Número de página para paginación (1-based)',
    type: Number,
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    type: Number,
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filtrar películas por título (búsqueda parcial)',
    type: String,
    example: 'Inception',
  })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar películas por ID del género',
    type: String,
    example: '1',
  })
  @IsOptional()
  @Transform(({ value }: { value: string | number | null | undefined }) =>
    value === null || value === undefined ? value : BigInt(value),
  )
  genero?: bigint;

  @ApiPropertyOptional({
    description: 'Filtrar películas por ID del idioma',
    type: String,
    example: '1',
  })
  @IsOptional()
  @Transform(({ value }: { value: string | number | null | undefined }) =>
    value === null || value === undefined ? value : BigInt(value),
  )
  idioma?: bigint;

  @ApiPropertyOptional({
    description: 'Fecha mínima de función disponible',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha máxima de función disponible',
    type: String,
    format: 'date-time',
    example: '2026-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @ApiPropertyOptional({
    description: 'Filtrar películas disponibles en la ciudad especificada',
    type: String,
    example: '1',
  })
  @IsOptional()
  @Transform(({ value }: { value: string | number | null | undefined }) =>
    value === null || value === undefined ? value : BigInt(value),
  )
  ciudad_id?: bigint;
}
