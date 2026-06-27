import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Laura Gomez', description: 'Nombre completo del usuario' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  name: string;

  @ApiProperty({ example: 'ejemplo@ejemplo.com', description: 'Correo electrónico único' })
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido.' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña (mínimo 6 caracteres)' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  @ApiProperty({ example: '99991111', description: 'Número de teléfono', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 1, description: 'ID del rol asignado' })
  @IsInt({ message: 'El rol debe ser un número entero válido.' })
  @IsNotEmpty({ message: 'El rol es obligatorio.' })
  roleId: number;
}
