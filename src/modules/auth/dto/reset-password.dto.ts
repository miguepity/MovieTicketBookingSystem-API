import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de recuperación recibido por email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token!: string;

  @ApiProperty({
    description: 'Nueva contraseña del usuario',
    format: 'password',
    example: 'NuevaPassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  newPassword!: string;
}
