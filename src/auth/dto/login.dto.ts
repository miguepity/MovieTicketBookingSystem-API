import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email del usuario', example: 'usuario@email.com' })
  email!: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'MiPassword123' })
  password!: string;
}
