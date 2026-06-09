import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsDecimal, Min } from 'class-validator';

export class CreatePagoEfectivoDto {
  @ApiProperty({ example: 1, description: 'ID de la reserva a confirmar' })
  @IsInt()
  @Min(1)
  id_reserva!: number;

  @ApiProperty({
    example: '150.00',
    description: 'Monto cobrado antes de descuento',
  })
  @IsDecimal()
  monto_original!: string;

  @ApiProperty({ example: '0.00', description: 'Monto descontado' })
  @IsDecimal()
  monto_descuento!: string;

  @ApiProperty({
    example: '150.00',
    description: 'Monto final cobrado en efectivo',
  })
  @IsDecimal()
  monto_final!: string;
}
