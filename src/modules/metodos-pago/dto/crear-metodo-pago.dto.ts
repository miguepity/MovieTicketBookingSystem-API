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

export type MetodoTipo = 'tarjeta' | 'efectivo';

export class CrearMetodoPagoDto {
  @ApiProperty({ enum: ['tarjeta', 'efectivo'] })
  @IsEnum(['tarjeta', 'efectivo'])
  tipo!: MetodoTipo;

  @ApiProperty({ example: '4111111111111111', required: false })
  @ValidateIf((o: CrearMetodoPagoDto) => o.tipo === 'tarjeta')
  @IsString()
  @Matches(/^\d{13,19}$/, { message: 'numero must be 13–19 digits' })
  @LuhnValid()
  numero?: string;

  @ApiProperty({ enum: ['visa', 'mastercard', 'amex'], required: false })
  @ValidateIf((o: CrearMetodoPagoDto) => o.tipo === 'tarjeta')
  @IsEnum(['visa', 'mastercard', 'amex'])
  marca?: 'visa' | 'mastercard' | 'amex';

  @ApiProperty({ example: '08/29', required: false })
  @ValidateIf((o: CrearMetodoPagoDto) => o.tipo === 'tarjeta')
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'expiracion must be MM/YY' })
  @NotExpired()
  expiracion?: string;

  @ApiProperty({ example: 'WILLIAM COLE', required: false })
  @ValidateIf((o: CrearMetodoPagoDto) => o.tipo === 'tarjeta')
  @IsString()
  @Length(2, 120)
  titular?: string;
}
