import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class QueryUsersDto {
  @ApiPropertyOptional({
    description:
      'Búsqueda por nombre o email (búsqueda parcial en ambos campos)',
    example: 'juan',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nombre (búsqueda parcial)',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por email (búsqueda parcial)',
    example: 'juan@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del usuario',
    example: 'activo',
    enum: ['activo', 'inactivo', 'suspendido'],
    enumName: 'EstadoUsuarioFilter',
  })
  @IsOptional()
  @IsString()
  estado?: string;

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
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Resultados por página',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
