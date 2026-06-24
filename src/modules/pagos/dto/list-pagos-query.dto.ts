import { IsInt, IsOptional, IsString, Min, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListPagosQueryDto {
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

  @ApiPropertyOptional({ description: 'Búsqueda libre: referencia_externa, numero_reserva, nombre o email del cliente' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: ['procesando', 'exitoso', 'rechazado', 'reembolsado'] })
  @IsOptional()
  @IsIn(['procesando', 'exitoso', 'rechazado', 'reembolsado'])
  estado?: string;

  @ApiPropertyOptional({ enum: ['tarjeta', 'efectivo'] })
  @IsOptional()
  @IsIn(['tarjeta', 'efectivo'])
  metodo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id_cine?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id_ciudad?: string;

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;
}
