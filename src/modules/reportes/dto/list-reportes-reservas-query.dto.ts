import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ListReporteReservasQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por título de película',
    example: 'Spider-Man: No Way Home',
  })
  @IsOptional()
  @IsString()
  pelicula?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nombre de cine',
    example: 'Cinépolis Plaza Mayor',
  })
  @IsOptional()
  @IsString()
  cine?: string;

  @ApiPropertyOptional({
    description: 'Filtrar reservas por fecha (ISO 8601)',
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de la reserva',
    example: 'CONFIRMADA',
  })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({
    description: 'Número de página (comienza en 1)',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 20,
    default: 20,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
