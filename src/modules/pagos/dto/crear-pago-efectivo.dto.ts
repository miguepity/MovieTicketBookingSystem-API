import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrearPagoEfectivoDto {
  @ApiProperty({
    description: 'ID de la reserva a pagar en efectivo',
    type: String,
    example: '42',
  })
  @IsString()
  id_reserva!: string;

  @ApiPropertyOptional({
    description: 'Código de cupón de descuento a aplicar',
    type: String,
    example: 'PROMO10',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  codigo_cupon?: string;
}
