import { ApiProperty } from '@nestjs/swagger';

/**
 * Per-row shape for the users listing endpoint.
 * Returned inside the `data` array of `UserListResponseDto`.
 *
 * Matches the runtime output of `UsersService.findAll`:
 * id, nombre, email, telefono (string|null), estado, id_rol, rol,
 * notificaciones_activas, created_at.
 * Note: num_reservas is NOT included in findAll — only in findClientesPaginated.
 */
export class UsuarioItemDto {
  @ApiProperty({ description: 'ID del usuario', example: '1' })
  id!: string;

  @ApiProperty({ description: 'Nombre completo', example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ description: 'Email del usuario', example: 'juan@email.com' })
  email!: string;

  @ApiProperty({
    description: 'Teléfono del usuario (puede ser null)',
    example: '+502 5555-0001',
    nullable: true,
    required: false,
  })
  telefono!: string | null;

  @ApiProperty({ description: 'Estado del usuario', example: 'activo' })
  estado!: string;

  @ApiProperty({ description: 'ID del rol', example: '1' })
  id_rol!: string;

  @ApiProperty({ description: 'Nombre del rol', example: 'cliente' })
  rol!: string;

  @ApiProperty({
    description: 'Si el usuario recibe notificaciones',
    example: false,
  })
  notificaciones_activas!: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  created_at!: string;
}
