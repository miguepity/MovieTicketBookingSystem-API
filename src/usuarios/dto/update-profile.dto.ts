import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  @Length(3, 150, { message: 'El nombre debe tener entre 3 y 150 caracteres.' })
  nombre?: string;

  @ApiPropertyOptional({ example: 'nuevo@correo.com' })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido.' })
  email?: string;

  @ApiPropertyOptional({ example: '+504 9999 9999' })
  @IsOptional()
  @IsString()
  @Length(7, 20, { message: 'El teléfono debe tener un formato válido.' })
  telefono?: string;
}
