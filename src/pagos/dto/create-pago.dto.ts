import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsNotEmpty,
  MaxLength,
  Min,
  IsDecimal,
} from 'class-validator';

export class CreatePagoDto {
  @ApiProperty({ example: 1, description: 'ID de la reserva' })
  @IsInt()
  @Min(1)
  id_reserva!: number;

  @ApiProperty({
    example: '150.00',
    description: 'Monto original sin descuentos',
  })
  @IsDecimal()
  monto_original!: string;

  @ApiProperty({ example: '0.00', description: 'Monto de descuento aplicado' })
  @IsDecimal()
  monto_descuento!: string;

  @ApiProperty({ example: '150.00', description: 'Monto final a cobrar' })
  @IsDecimal()
  monto_final!: string;

  @ApiProperty({
    example: 'tarjeta',
    description: 'Método de pago (tarjeta, efectivo, etc)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  metodo!: string;
}
