import { ApiProperty } from '@nestjs/swagger';
import { MetodoPago } from '../../../common/enums/metodo-pago.enum';
import { MarcaTarjeta } from '../../../common/enums/marca-tarjeta.enum';

export class MetodoPagoResponseDto {
  @ApiProperty({ example: '42' })
  id!: string;

  @ApiProperty({ enum: MetodoPago })
  tipo!: MetodoPago;

  @ApiProperty({ enum: MarcaTarjeta, nullable: true, example: 'visa' })
  marca!: MarcaTarjeta | null;

  @ApiProperty({ nullable: true, example: '1234' })
  ultimos4!: string | null;

  @ApiProperty({ nullable: true, example: '08/29' })
  expiracion!: string | null;

  @ApiProperty({ nullable: true, example: 'WILLIAM COLE' })
  titular!: string | null;

  @ApiProperty()
  predeterminado!: boolean;

  @ApiProperty({ example: '2026-06-15T12:34:56.000Z' })
  created_at!: string;
}
