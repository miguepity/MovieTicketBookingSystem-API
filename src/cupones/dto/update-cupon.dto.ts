import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDecimal,
  IsDateString,
  IsInt,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class UpdateCuponDto {
  @ApiProperty({
    example: 'DESC20',
    description: 'Código único del cupón',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigo?: string;

  @ApiProperty({
    example: 'descuento',
    description: 'Tipo de cupón',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  tipo?: string;

  @ApiProperty({
    example: '20.50',
    description: 'Valor del descuento',
    required: false,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  valor?: number;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Fecha de expiración',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fecha_expiracion?: string;

  @ApiProperty({
    example: 100,
    description: 'Usos máximos permitidos',
    required: false,
  })
  @IsOptional()
  @IsInt()
  usos_maximos?: number;

  @ApiProperty({
    example: true,
    description: 'Si el cupón está activo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
