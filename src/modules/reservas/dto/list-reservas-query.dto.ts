import { IsInt, IsOptional, IsString, Min, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListReservasQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 20;

  @ApiPropertyOptional({ description: 'Búsqueda libre: número de reserva, nombre o email del cliente' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: ['pendiente_pago', 'pagada', 'cancelada', 'reembolsada', 'expirada'] })
  @IsOptional()
  @IsIn(['pendiente_pago', 'pagada', 'cancelada', 'reembolsada', 'expirada'])
  estado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id_funcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id_cine?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id_pelicula?: string;

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;
}
