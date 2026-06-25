import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, IsIn, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListStaffQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    description: 'Resultados por página',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({
    description: 'Búsqueda por nombre o email (búsqueda parcial)',
    example: 'juan',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del personal',
    example: 'activo',
    enum: ['activo', 'bloqueado'],
    enumName: 'EstadoStaffFilter',
  })
  @IsOptional()
  @IsIn(['activo', 'bloqueado'])
  estado?: string;
}
