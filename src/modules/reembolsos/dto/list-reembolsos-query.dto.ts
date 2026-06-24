import { IsInt, IsOptional, IsString, Min, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListReembolsosQueryDto {
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

  @ApiPropertyOptional({ enum: ['pendiente', 'procesado', 'rechazado'] })
  @IsOptional()
  @IsIn(['pendiente', 'procesado', 'rechazado'])
  estado?: string;

  @ApiPropertyOptional({ enum: ['tarjeta', 'efectivo'] })
  @IsOptional()
  @IsIn(['tarjeta', 'efectivo'])
  metodo?: string;

  @ApiPropertyOptional({ description: 'Búsqueda libre: numero_reserva, nombre o email del cliente' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;
}
