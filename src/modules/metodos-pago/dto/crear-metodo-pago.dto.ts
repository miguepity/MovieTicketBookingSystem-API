import {
  IsEnum,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LuhnValid } from '../../../common/validators/luhn-valid.validator';
import { NotExpired } from '../../../common/validators/not-expired.validator';
import { MetodoPago } from '../../../common/enums/metodo-pago.enum';
import { MarcaTarjeta } from '../../../common/enums/marca-tarjeta.enum';

export class CrearMetodoPagoDto {
  @ApiProperty({ enum: MetodoPago })
  @IsEnum(MetodoPago)
  tipo!: MetodoPago;

  @ApiProperty({ example: '4111111111111111', required: false })
  @ValidateIf((o: CrearMetodoPagoDto) => o.tipo === MetodoPago.TARJETA)
  @IsString()
  @Matches(/^\d{13,19}$/, { message: 'numero must be 13–19 digits' })
  @LuhnValid()
  numero?: string;

  @ApiProperty({ enum: MarcaTarjeta, required: false })
  @ValidateIf((o: CrearMetodoPagoDto) => o.tipo === MetodoPago.TARJETA)
  @IsEnum(MarcaTarjeta)
  marca?: MarcaTarjeta;

  @ApiProperty({ example: '08/29', required: false })
  @ValidateIf((o: CrearMetodoPagoDto) => o.tipo === MetodoPago.TARJETA)
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'expiracion must be MM/YY' })
  @NotExpired()
  expiracion?: string;

  @ApiProperty({ example: 'WILLIAM COLE', required: false })
  @ValidateIf((o: CrearMetodoPagoDto) => o.tipo === MetodoPago.TARJETA)
  @IsString()
  @Length(2, 120)
  titular?: string;
}
