import { ApiProperty } from '@nestjs/swagger';

class UsuarioResponse {
  @ApiProperty({ description: 'ID del usuario', example: '1' })
  id!: string;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ description: 'Email del usuario', example: 'usuario@email.com' })
  email!: string;

  @ApiProperty({ description: 'ID del rol del usuario', example: '1' })
  id_rol!: string;

  @ApiProperty({ description: 'Estado del usuario', example: 'activo' })
  estado!: string;
}

export class AuthResponse {
  @ApiProperty({ description: 'Token JWT de acceso' })
  access_token!: string;

  @ApiProperty({ description: 'Datos del usuario autenticado', type: UsuarioResponse })
  usuario!: UsuarioResponse;
}
