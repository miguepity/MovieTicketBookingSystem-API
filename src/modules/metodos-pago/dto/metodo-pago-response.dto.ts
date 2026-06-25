import { ApiProperty } from '@nestjs/swagger';
import { MetodoPago } from '../../../common/enums/metodo-pago.enum';
import { MarcaTarjeta } from '../../../common/enums/marca-tarjeta.enum';

export class MetodoPagoResponseDto {
  @ApiProperty({
    type: String,
    description: 'ID del método de pago (BigInt como string)',
    example: '42',
  })
  id!: string;

  @ApiProperty({
    enum: MetodoPago,
    enumName: 'MetodoPago',
    description: 'Tipo de método de pago',
    example: MetodoPago.TARJETA,
  })
  tipo!: MetodoPago;

  @ApiProperty({
    enum: MarcaTarjeta,
    enumName: 'MarcaTarjeta',
    nullable: true,
    description: 'Marca de la tarjeta (null si no aplica)',
    example: MarcaTarjeta.VISA,
  })
  marca!: MarcaTarjeta | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Últimos 4 dígitos de la tarjeta (null si no aplica)',
    example: '1234',
  })
  ultimos4!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Fecha de vencimiento MM/YY (null si no aplica)',
    example: '08/29',
  })
  expiracion!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Nombre del titular (null si no aplica)',
    example: 'WILLIAM COLE',
  })
  titular!: string | null;

  @ApiProperty({
    type: Boolean,
    description: 'Indica si es el método de pago predeterminado',
    example: true,
  })
  predeterminado!: boolean;

  @ApiProperty({
    type: String,
    description: 'Fecha de creación (ISO date-time)',
    format: 'date-time',
    example: '2026-06-15T12:34:56.000Z',
  })
  created_at!: string;
}
