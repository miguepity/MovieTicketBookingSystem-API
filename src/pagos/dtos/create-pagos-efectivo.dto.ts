import { IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePagoEfectivoDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la reserva',
  })
  @IsNotEmpty()
  @IsNumber()
  id_reserva: number;

  @ApiProperty({
    example: 1,
    description: 'ID del cupón',
  })
  @IsOptional()
  @IsNumber()
  id_cupon?: number;

  @ApiProperty({
    example: 100,
    description: 'Monto original',
  })
  @IsNotEmpty()
  @IsPositive()
  monto_original: number;

  @ApiProperty({
    example: 0,
    description: 'Monto del descuento',
  })
  @IsNotEmpty()
  @IsOptional()
  monto_descuento: number;

  @ApiProperty({
    example: 100,
    description: 'Monto final',
  })
  @IsNotEmpty()
  @IsPositive()
  monto_final: number;
}