import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Laura Gomez', description: 'Nombre completo del usuario' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;

  @ApiProperty({ example: 'example@mail.com', description: 'Correo electrónico único' })
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña segura' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;

  @ApiProperty({ example: '99991111', description: 'Número de teléfono', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 1, description: 'ID del rol asignado (ej: 1 para ADMIN, 2 para CLIENTE)' })
  @IsInt({ message: 'El id_rol debe ser un número entero válido' })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  roleId!: number;
}