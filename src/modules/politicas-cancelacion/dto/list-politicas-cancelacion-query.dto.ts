import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class ListPoliticasCancelacionQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página para la paginación',
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
    description: 'Cantidad de registros por página',
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
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filtrar políticas por ID del cine',
    type: String,
    example: '1',
  })
  @IsOptional()
  id_cine?: string;

  @ApiPropertyOptional({
    description: 'Filtrar políticas por estado activo',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activa?: boolean;
}
