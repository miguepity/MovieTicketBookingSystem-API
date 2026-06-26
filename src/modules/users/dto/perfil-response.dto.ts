import { ApiProperty } from '@nestjs/swagger';

/**
 * Response for `GET /me/perfil`.
 * Matches the runtime output of `UsersService.findById`:
 * { id (toString), nombre, email, telefono, notificaciones_activas, estado, created_at }
 */
export class PerfilResponseDto {
  @ApiProperty({ description: 'ID del usuario', example: '1' })
  id!: string;

  @ApiProperty({ description: 'Nombre completo', example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ description: 'Email del usuario', example: 'juan@example.com' })
  email!: string;

  @ApiProperty({
    description: 'Teléfono del usuario (puede ser null)',
    example: '+502 1234 5678',
    nullable: true,
    required: false,
  })
  telefono!: string | null;

  @ApiProperty({ description: 'Preferencia de notificaciones', example: true })
  notificaciones_activas!: boolean;

  @ApiProperty({ description: 'Estado del usuario', example: 'activo' })
  estado!: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  created_at!: string;
}
