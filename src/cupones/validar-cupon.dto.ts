import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ValidarCuponDto {
  @ApiProperty({ example: 'PROMO2026', description: 'Código del cupón a validar' })
  @IsString()
  @IsNotEmpty({ message: 'El código es requerido para la validación' })
  @MaxLength(50)
  codigo!: string;
}