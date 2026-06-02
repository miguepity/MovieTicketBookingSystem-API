import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class QueryPeliculaDto {
  @ApiPropertyOptional({ description: 'Búsqueda parcial por título' })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({ description: 'ID del género' })
  @IsOptional()
  @Transform(({ value }) => BigInt(value as string | number))
  genero?: bigint;

  @ApiPropertyOptional({ description: 'ID del idioma' })
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

  @ApiPropertyOptional({ description: 'ID de la ciudad' })
  @IsOptional()
  @Transform(({ value }) => BigInt(value as string | number))
  ciudad_id?: bigint;
}
