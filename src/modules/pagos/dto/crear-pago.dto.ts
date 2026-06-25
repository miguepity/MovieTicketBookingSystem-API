import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetodoPago } from 'src/common/enums/metodo-pago.enum';

export class CrearPagoDto {
  @ApiProperty({
    description: 'ID de la reserva a pagar',
    type: String,
    example: '42',
  })
  @IsString()
  id_reserva!: string;

  @ApiProperty({
    description: 'Método de pago seleccionado',
    enum: MetodoPago,
    enumName: 'MetodoPago',
    example: MetodoPago.TARJETA,
  })
  @IsEnum(MetodoPago)
  metodo!: MetodoPago;

  @ApiPropertyOptional({
    description: 'Referencia externa del método de pago (token de transacción, último dígito de tarjeta, etc.)',
    type: String,
    example: '****1234',
  })
  @IsString()
  @IsOptional()
  referencia_externa?: string;

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
