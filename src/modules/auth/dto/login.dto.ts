import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email del usuario', example: 'usuario@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'MiPassword123' })
  @IsString()
  password!: string;
}
