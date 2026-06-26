import { ApiProperty } from '@nestjs/swagger';

/**
 * Response for `POST /admin/staff/{id}/reset-password`.
 * Matches the runtime output of `UsersService.resetStaffPassword`:
 * { tempPassword: string }
 */
export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Contraseña temporal generada para el staff',
    example: 'a3f8b2c9d1e4f7a0',
  })
  tempPassword!: string;
}
