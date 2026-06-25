import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ListAuditLogQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página (por defecto 1)',
    type: Number,
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página (máximo 100)',
    type: Number,
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size?: number = 20;

  @ApiPropertyOptional({
    description: 'Filtrar por acciones (array de strings)',
    type: [String],
    example: ['CREATE', 'UPDATE'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accion?: string[];

  @ApiPropertyOptional({
    description: 'Filtrar por nombre de entidad',
    type: String,
    example: 'Pelicula',
  })
  @IsOptional()
  @IsString()
  entidad?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de la entidad',
    type: String,
    example: '123',
  })
  @IsOptional()
  @IsString()
  entidad_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del auditor',
    type: String,
    example: '456',
  })
  @IsOptional()
  @IsString()
  id_auditor?: string;

  @ApiPropertyOptional({
    description: 'Filtrar desde una fecha (formato ISO 8601)',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({
    description: 'Filtrar hasta una fecha (formato ISO 8601)',
    type: String,
    format: 'date-time',
    example: '2026-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;
}
