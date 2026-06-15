import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePagoEfectivoDto {
  @ApiProperty({ description: 'ID de la reserva' })
  @IsNumber()
  id_reserva: number;

  @ApiProperty({ description: 'Precio por asiento en lempiras', example: 150 })
  @IsNumber()
  precio_por_asiento: number;

  @ApiPropertyOptional({ description: 'Referencia o numero de recibo' })
  @IsOptional()
  @IsString()
  referencia_externa: string;
}
