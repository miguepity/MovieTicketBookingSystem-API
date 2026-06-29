import { IsInt, IsOptional, IsString, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum VistaMisReservas {
  PROXIMOS = 'proximos',
  PASADOS = 'pasados',
  CANCELADOS = 'cancelados',
}

export class ListMisReservasQueryDto {
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
    default: 5,
    minimum: 1,
    maximum: 100,
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 5;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de la reserva',
    example: 'pagada',
  })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({
    description:
      'Vista del tab del cliente. Combina filtros por estado y por fecha de la función: ' +
      '"proximos" = estado pagada o pendiente_pago + función futura. ' +
      '"pasados" = estado pagada + función pasada. ' +
      '"cancelados" = cancelada, reembolsada o expirada.',
    enum: VistaMisReservas,
    example: VistaMisReservas.PROXIMOS,
  })
  @IsOptional()
  @IsEnum(VistaMisReservas)
  vista?: VistaMisReservas;
}
