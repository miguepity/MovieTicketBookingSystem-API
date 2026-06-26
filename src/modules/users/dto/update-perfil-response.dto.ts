import { ApiProperty } from '@nestjs/swagger';

/**
 * Response shape for PATCH /admin/users/me (deprecated — use PATCH /me/perfil).
 * Matches the Prisma select returned by `UsersService.updatePerfil`.
 */
export class UpdatePerfilResponseDto {
  @ApiProperty({ description: 'ID del usuario', example: '1' })
  id!: string;

  @ApiProperty({ description: 'Nombre completo', example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ description: 'Email del usuario', example: 'juan@example.com' })
  email!: string;

  @ApiProperty({
    description: 'Teléfono del usuario',
    example: '+502 1234 5678',
    nullable: true,
    required: false,
  })
  telefono!: string | null;

  @ApiProperty({ description: 'Preferencia de notificaciones', example: true })
  notificaciones_activas!: boolean;
}
