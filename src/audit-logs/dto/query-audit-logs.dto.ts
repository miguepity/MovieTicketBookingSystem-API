import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryAuditLogsDto {
  @ApiPropertyOptional({
    description: 'Filtrar por tipo de acción (búsqueda parcial, sin distinción de mayúsculas)',
    example: 'CINE_CREADO',
  })
  @IsOptional()
  @IsString()
  accion?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario afectado por la acción (id_usuario)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_usuario?: number;

  @ApiPropertyOptional({
    description: 'ID del usuario que realizó la acción (id_auditor)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_auditor?: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del rango (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  desde?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del rango (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  hasta?: string;

  @ApiPropertyOptional({ description: 'Número de página (inicia en 1)', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Registros por página', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
