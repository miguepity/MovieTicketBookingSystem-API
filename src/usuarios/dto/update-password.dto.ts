import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    example: '123456',
    description: 'Contraseña actual',
    type: String,
  })
  @IsNotEmpty({ message: 'La contraseña actual es requerida.' })
  @IsString()
  passwordActual: string;

  @ApiProperty({
    example: '123456',
    description: 'Nueva contraseña',
    type: String,
  })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida.' })
  @IsString()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres.' })
  passwordNueva: string;
}