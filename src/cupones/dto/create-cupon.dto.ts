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

export class CreateCuponDto {
  @ApiProperty({ example: 'DESC20', description: 'Código único del cupón' })
  @IsString()
  @MaxLength(50)
  codigo: string;

  @ApiProperty({ example: 'descuento', description: 'Tipo de cupón' })
  @IsString()
  @MaxLength(20)
  tipo: string;

  @ApiProperty({ example: '20.50', description: 'Valor del descuento' })
  @IsDecimal({ decimal_digits: '0,2' })
  valor: number;

  @ApiProperty({ example: '2025-12-31', description: 'Fecha de expiración' })
  @IsDateString()
  fecha_expiracion: string;

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
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
