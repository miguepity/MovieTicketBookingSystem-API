import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryPeliculaDto {
  @ApiPropertyOptional({
    description: 'Búsqueda parcial por título',
    example: 'Inception',
  })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({ description: 'ID del género', example: '1' })
  @IsOptional()
  @Transform(({ value }) => BigInt(value as string | number))
  genero?: bigint;

  @ApiPropertyOptional({ description: 'ID del idioma', example: '1' })
  @IsOptional()
  @Transform(({ value }) => BigInt(value as string | number))
  idioma?: bigint;

  @ApiPropertyOptional({
    description: 'Fecha mínima de función (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha máxima de función (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @ApiPropertyOptional({ description: 'ID de la ciudad', example: '1' })
  @IsOptional()
  @Transform(({ value }) => BigInt(value as string | number))
  ciudad_id?: bigint;

  @ApiPropertyOptional({ description: 'Página (1-based)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Tamaño de página', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
