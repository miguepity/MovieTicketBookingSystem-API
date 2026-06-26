import { ApiProperty } from '@nestjs/swagger';

/**
 * Per-row shape for the /admin/clientes listing endpoint.
 * Returned inside the `data` array of `ClientesPageResponseDto`.
 *
 * Matches the runtime output of `UsersService.findClientesPaginated`:
 * id, nombre, email, telefono (string|null), estado,
 * notificaciones_activas, num_reservas, created_at.
 *
 * NOTE: This is intentionally DIFFERENT from UsuarioItemDto:
 * - Includes `num_reservas` (from _count.reservas)
 * - Does NOT include `id_rol` or `rol`
 * - Pagination envelope is flat { data, total, page, limit } — no nested `meta`
 */
export class ClienteListItemDto {
  @ApiProperty({ description: 'ID del cliente', example: '1' })
  id!: string;

  @ApiProperty({ description: 'Nombre completo', example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ description: 'Email del cliente', example: 'juan@email.com' })
  email!: string;

  @ApiProperty({
    description: 'Teléfono del cliente (puede ser null)',
    example: '+502 5555-0001',
    nullable: true,
    required: false,
  })
  telefono!: string | null;

  @ApiProperty({ description: 'Estado del cliente', example: 'activo' })
  estado!: string;

  @ApiProperty({
    description: 'Si el cliente recibe notificaciones',
    example: false,
  })
  notificaciones_activas!: boolean;

  @ApiProperty({
    description: 'Número de reservas del cliente',
    example: 3,
  })
  num_reservas!: number;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  created_at!: string;
}
