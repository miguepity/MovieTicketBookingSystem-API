import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCuponeDto {
  @ApiProperty({ example: 'PROMO2026', description: 'Código único del cupón' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ example: 'PORCENTAJE', description: 'Tipo de descuento (ej: PORCENTAJE, MONTO)' })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({ example: 15.5, description: 'Valor del descuento' })
  @IsNumber()
  @IsNotEmpty()
  valor: number;

  @ApiProperty({ example: '2026-12-31T23:59:59Z', description: 'Fecha de expiración' })
  @IsDateString()
  @IsNotEmpty()
  fecha_expiracion: string;

  @ApiPropertyOptional({ example: 100, description: 'Número máximo de usos' })
  @IsInt()
  @IsOptional()
  usos_maximos?: number;

  @ApiPropertyOptional({ example: true, description: 'Si el cupón está activo' })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
