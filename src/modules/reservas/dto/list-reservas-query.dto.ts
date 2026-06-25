import { IsInt, IsOptional, IsString, Min, IsEnum, IsDateString, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoReserva } from '../../../common/enums/estado-reserva.enum';

export class ListReservasQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página (comenzando en 1)',
    type: Number,
    default: 1,
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página',
    type: Number,
    default: 20,
    minimum: 1,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({
    description: 'Búsqueda libre: número de reserva, nombre o email del cliente',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filtrar reservas por estado',
    enum: EstadoReserva,
    enumName: 'EstadoReserva',
    example: EstadoReserva.PAGADA,
  })
  @IsOptional()
  @IsEnum(EstadoReserva)
  estado?: EstadoReserva;

  @ApiPropertyOptional({
    description: 'ID de la función a filtrar',
    type: String,
    example: '5',
  })
  @IsOptional()
  @IsString()
  id_funcion?: string;

  @ApiPropertyOptional({
    description: 'ID del cine a filtrar',
    type: String,
    example: '2',
  })
  @IsOptional()
  @IsString()
  id_cine?: string;

  @ApiPropertyOptional({
    description: 'ID de la película a filtrar',
    type: String,
    example: '3',
  })
  @IsOptional()
  @IsString()
  id_pelicula?: string;

  @ApiPropertyOptional({
    description: 'Fecha inicial del rango (formato ISO date-time)',
    type: String,
    format: 'date-time',
    example: '2026-06-25T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({
    description: 'Fecha final del rango (formato ISO date-time)',
    type: String,
    format: 'date-time',
    example: '2026-06-30T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;
}
