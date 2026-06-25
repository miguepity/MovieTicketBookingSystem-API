import { IsInt, IsOptional, IsString, Min, IsIn, IsDateString, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListPagosQueryDto {
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
    description: 'Búsqueda libre: referencia externa, número de reserva, nombre o email del cliente',
    example: 'TRX123456789',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filtrar pagos por estado',
    enum: ['procesando', 'exitoso', 'rechazado', 'reembolsado'],
    enumName: 'EstadoPagoFilter',
    example: 'exitoso',
  })
  @IsOptional()
  @IsIn(['procesando', 'exitoso', 'rechazado', 'reembolsado'])
  estado?: string;

  @ApiPropertyOptional({
    description: 'Filtrar pagos por método',
    enum: ['tarjeta', 'efectivo'],
    enumName: 'MetodoPagoFilter',
    example: 'tarjeta',
  })
  @IsOptional()
  @IsIn(['tarjeta', 'efectivo'])
  metodo?: string;

  @ApiPropertyOptional({
    description: 'ID del cine a filtrar',
    type: String,
    example: '2',
  })
  @IsOptional()
  @IsString()
  id_cine?: string;

  @ApiPropertyOptional({
    description: 'ID de la ciudad a filtrar',
    type: String,
    example: '1',
  })
  @IsOptional()
  @IsString()
  id_ciudad?: string;

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
