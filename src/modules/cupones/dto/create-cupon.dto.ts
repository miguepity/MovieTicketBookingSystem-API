import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  MaxLength,
  Max,
  MinLength,
} from 'class-validator';

export class CreateCuponDto {
  @ApiProperty({
    description: 'Código único del cupón',
    example: 'PROMO10',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  codigo!: string;

  @ApiProperty({
    description: 'Tipo de descuento (porcentaje o monto fijo)',
    example: 'porcentaje',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  tipo!: string;

  @ApiProperty({
    description: 'Valor del descuento',
    example: 10,
    minimum: 0.01,
    maximum: 999999.99,
  })
  @IsNumber()
  @Min(0.01)
  @Max(999999.99)
  valor!: number;

  @ApiProperty({
    description: 'Fecha de expiración del cupón (ISO date-time)',
    example: '2026-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  @IsDateString()
  fecha_expiracion!: string;

  @ApiPropertyOptional({
    description: 'Cantidad máxima de usos permitidos',
    example: 100,
    minimum: 1,
    maximum: 1000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000000)
  usos_maximos?: number;

  @ApiPropertyOptional({
    description: 'Título descriptivo del cupón',
    example: 'Promo Verano',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  titulo?: string;

  @ApiPropertyOptional({
    description: 'Descripción larga del cupón',
    example: 'Disfruta un 10 % de descuento en tu primera compra.',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
