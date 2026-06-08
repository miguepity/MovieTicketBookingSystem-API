import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearPagoEfectivoDto {
  @ApiProperty({ example: '42' })
  @IsString()
  id_reserva!: string;

  @ApiProperty({ required: false, example: 'PROMO10' })
  @IsString()
  @IsOptional()
  codigo_cupon?: string;
}
