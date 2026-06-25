import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class ActualizarStaffDto {
  @ApiPropertyOptional({
    description: 'Nombre del personal (mínimo 2 caracteres)',
    example: 'Juan García',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Email del personal',
    format: 'email',
    example: 'juan.garcia@cinema.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
