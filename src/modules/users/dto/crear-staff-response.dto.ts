import { ApiProperty } from '@nestjs/swagger';
import { StaffListItemDto } from './staff-list-item.dto';

/**
 * Response for `POST /admin/staff`.
 * Matches the runtime output of `UsersService.crearStaff`:
 * { user: StaffView, tempPassword?: string }
 *
 * `tempPassword` is only present when no password was supplied in the request
 * (the service generates a temporary one in that case).
 */
export class CrearStaffResponseDto {
  @ApiProperty({ type: StaffListItemDto, description: 'Datos del staff creado' })
  user!: StaffListItemDto;

  @ApiProperty({
    description: 'Contraseña temporal generada (solo presente si no se envió password)',
    example: 'a3f8b2c9d1e4f7a0',
    required: false,
  })
  tempPassword?: string;
}
