import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CrearStaffDto {
  @ApiProperty({
    description: 'Nombre del personal (mínimo 2 caracteres)',
    example: 'Juan García',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  nombre: string;

  @ApiProperty({
    description: 'Email del personal',
    format: 'email',
    example: 'juan.garcia@cinema.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Contraseña inicial (mínimo 8 caracteres)',
    format: 'password',
    example: 'MiPassword123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
