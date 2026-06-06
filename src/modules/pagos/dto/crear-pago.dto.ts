import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MetodoPago } from 'src/common/enums/metodo-pago.enum';

export class CrearPagoDto {
  @ApiProperty({ example: '42' })
  @IsString()
  id_reserva!: string;

  @ApiProperty({ enum: MetodoPago })
  @IsEnum(MetodoPago)
  metodo!: MetodoPago;

  @ApiProperty({ required: false, example: '****1234' })
  @IsString()
  @IsOptional()
  referencia_externa?: string;

  @ApiProperty({ required: false, example: 'PROMO10' })
  @IsString()
  @IsOptional()
  codigo_cupon?: string;
}
