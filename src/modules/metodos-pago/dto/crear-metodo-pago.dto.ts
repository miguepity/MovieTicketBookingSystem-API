import { IsEnum, IsString, Length, Matches, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LuhnValid } from '../../../common/validators/luhn-valid.validator';
import { NotExpired } from '../../../common/validators/not-expired.validator';
import { MetodoPago } from '../../../common/enums/metodo-pago.enum';
import { MarcaTarjeta } from '../../../common/enums/marca-tarjeta.enum';

export class CrearMetodoPagoDto {
  @ApiProperty({
    enum: MetodoPago,
    enumName: 'MetodoPago',
    description: 'Tipo de método de pago',
    example: MetodoPago.TARJETA,
  })
  @IsEnum(MetodoPago)
  tipo!: MetodoPago;

  @ApiProperty({
    example: '4111111111111111',
    required: false,
    description: 'Número de tarjeta (13-19 dígitos, validación Luhn)',
    pattern: '^\\d{13,19}$',
  })
  @ValidateIf((o: CrearMetodoPagoDto) => o.tipo === MetodoPago.TARJETA)
  @IsString()
  @Matches(/^\d{13,19}$/, { message: 'numero debe ser 13–19 dígitos' })
  @LuhnValid()
  numero?: string;

  @ApiProperty({
    enum: MarcaTarjeta,
    enumName: 'MarcaTarjeta',
    required: false,
    description: 'Marca de la tarjeta (Visa, Mastercard, etc.)',
    example: MarcaTarjeta.VISA,
  })
  @ValidateIf((o: CrearMetodoPagoDto) => o.tipo === MetodoPago.TARJETA)
  @IsEnum(MarcaTarjeta)
  marca?: MarcaTarjeta;

  @ApiProperty({
    example: '08/29',
    required: false,
    description: 'Fecha de vencimiento (formato MM/YY)',
    pattern: '^(0[1-9]|1[0-2])/\\d{2}$',
  })
  @ValidateIf((o: CrearMetodoPagoDto) => o.tipo === MetodoPago.TARJETA)
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'expiracion debe ser MM/YY' })
  @NotExpired()
  expiracion?: string;

  @ApiProperty({
    example: 'WILLIAM COLE',
    required: false,
    description: 'Nombre del titular de la tarjeta',
    minLength: 2,
    maxLength: 120,
  })
  @ValidateIf((o: CrearMetodoPagoDto) => o.tipo === MetodoPago.TARJETA)
  @IsString()
  @Length(2, 120)
  titular?: string;
}
