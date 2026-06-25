import { IsInt, IsOptional, IsString, Min, IsEnum, IsDateString, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoReembolso } from '../../../common/enums/estado-reembolso.enum';
import { MetodoPago } from '../../../common/enums/metodo-pago.enum';

export class ListReembolsosQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, maximum: 10000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ enum: EstadoReembolso, enumName: 'EstadoReembolso', description: 'Filtrar por estado del reembolso' })
  @IsOptional()
  @IsEnum(EstadoReembolso)
  estado?: EstadoReembolso;

  @ApiPropertyOptional({
    enum: MetodoPago,
    enumName: 'MetodoPago',
    description: 'Filtrar por método de pago original',
  })
  @IsOptional()
  @IsEnum(MetodoPago)
  metodo?: MetodoPago;

  @ApiPropertyOptional({
    description: 'Búsqueda libre: numero_reserva, nombre o email del cliente',
    example: 'RES-123456',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Fecha desde (ISO date-time)',
    format: 'date-time',
    example: '2026-06-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (ISO date-time)',
    format: 'date-time',
    example: '2026-06-30T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;
}
