import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email del usuario',
    format: 'email',
    example: 'usuario@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    format: 'password',
    example: 'MiPassword123!',
  })
  @IsString()
  password!: string;
}
