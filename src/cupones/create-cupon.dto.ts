import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsEnum, IsNumber, IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateCuponDto {
  @ApiProperty({ example: 'PROMO2026', description: 'Código único del cupón' })
  @IsString()
  @IsNotEmpty({ message: 'El código del cupón es obligatorio' })
  @MaxLength(50, { message: 'El código no puede exceder los 50 caracteres' })
  codigo!: string;

  @ApiProperty({ example: 'PORCENTAJE', enum: ['PORCENTAJE', 'FIJO'] })
  @IsEnum(['PORCENTAJE', 'FIJO'], { message: 'El tipo debe ser PORCENTAJE o FIJO' })
  @IsNotEmpty()
  tipo!: string;

  @ApiProperty({ example: 15.00, description: 'Valor del descuento (Porcentaje o monto fijo)' })
  @IsNumber({}, { message: 'El valor debe ser un número decimal o entero' })
  @Min(0, { message: 'El valor no puede ser negativo' })
  @IsNotEmpty()
  valor!: number;

  @ApiProperty({ example: '2026-12-31', description: 'Fecha de expiración (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Debe ser una fecha válida' })
  @IsNotEmpty()
  fecha_expiracion!: string;

  @ApiProperty({ example: 100, required: false, description: 'Cantidad máxima de usos permitidos' })
  @IsOptional()
  @IsInt()
  @Min(1)
  usos_maximos?: number;
}