import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateCuponDto {
  @ApiProperty({
    description: 'Código único del cupón',
    example: 'PROMO10',
  })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({
    description: 'Tipo de descuento (porcentaje o monto fijo)',
    example: 'porcentaje',
  })
  @IsString()
  tipo!: string;

  @ApiProperty({
    description: 'Valor del descuento',
    example: 10,
  })
  @IsNumber()
  valor!: number;

  @ApiProperty({
    description: 'Fecha de expiración del cupón',
    example: '2026-12-31',
  })
  @IsDateString()
  fecha_expiracion!: string;

  @ApiPropertyOptional({
    description: 'Cantidad máxima de usos permitidos',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usos_maximos?: number;
}
