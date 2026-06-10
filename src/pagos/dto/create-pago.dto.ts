import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePagoDto {
  @ApiProperty({ description: 'ID de la reserva' })
  @IsNumber()
  id_reserva: number;

  @ApiProperty({ description: 'Metodo de pago', example: 'tarjeta' })
  @IsString()
  metodo: string;

  @ApiProperty({ description: 'Precio por asiento en lempiras', example: 150 })
  @IsNumber()
  @Min(1)
  precio_por_asiento: number;

  @ApiPropertyOptional({ description: 'Codigo de cupon de descuento' })
  @IsOptional()
  @IsString()
  codigo_cupon?: string;

  @ApiPropertyOptional({ description: 'Referencia externa del pago' })
  @IsOptional()
  @IsString()
  referencia_externa?: string;
}
