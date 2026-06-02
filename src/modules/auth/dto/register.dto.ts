import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ description: 'Email del usuario', example: 'usuario@email.com' })
  email!: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'MiPassword123' })
  password!: string;

  @ApiProperty({ description: 'Teléfono del usuario', example: '+502 5555-5555', required: false })
  telefono?: string;
}
