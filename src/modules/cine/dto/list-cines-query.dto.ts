import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListCinesQueryDto {
  @ApiPropertyOptional({
    description: 'Búsqueda parcial por nombre del cine',
    example: 'Cinépolis',
  })
  @IsOptional()
  @IsString()
  name?: string;

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
  page?: number;

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
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de ciudad',
    type: String,
    example: '1',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_ciudad?: number;
}
