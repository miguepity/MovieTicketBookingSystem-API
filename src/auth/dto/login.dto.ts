import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'usuario@correo.com', description: 'Correo electrónico del usuario' })
  @IsEmail({}, { message: 'El correo electrónico proporcionado no es válido' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña del usuario (mínimo 8 caracteres)' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;
}
