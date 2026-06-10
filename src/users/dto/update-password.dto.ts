import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'OldPassword123!',
    description: 'Contraseña actual del usuario',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    example: 'NewSecurePassword456!',
    description: 'Nueva contraseña (mínimo 6 caracteres)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
