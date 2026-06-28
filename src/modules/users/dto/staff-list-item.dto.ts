import { ApiProperty } from '@nestjs/swagger';

/**
 * Per-row shape for staff listings.
 * Matches the `toStaffView` private helper in `UsersService`:
 * { id, nombre, email, estado, ultimo_acceso, created_at }
 *
 * Used in `StaffPageResponseDto`, `StaffResponseDto`, and as the `user`
 * field of `CrearStaffResponseDto`.
 */
export class StaffListItemDto {
  @ApiProperty({ description: 'ID del staff', example: '10' })
  id!: string;

  @ApiProperty({ description: 'Nombre completo', example: 'María García' })
  nombre!: string;

  @ApiProperty({
    description: 'Email del staff',
    example: 'maria.garcia@cine.com',
  })
  email!: string;

  @ApiProperty({ description: 'Estado del staff', example: 'activo' })
  estado!: string;

  @ApiProperty({
    description: 'Último acceso (puede ser null si nunca ha ingresado)',
    example: '2026-06-24T14:30:00.000Z',
    format: 'date-time',
    nullable: true,
    required: false,
  })
  ultimo_acceso!: string | null;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  created_at!: string;
}
