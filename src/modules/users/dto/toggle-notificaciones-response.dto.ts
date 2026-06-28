import { ApiProperty } from '@nestjs/swagger';

/**
 * Response shape for PATCH /:id/notificaciones.
 * Returns the new state of the notificaciones_activas flag.
 */
export class ToggleNotificacionesResponseDto {
  @ApiProperty({
    description: 'Nuevo estado de las notificaciones del usuario',
    example: true,
  })
  notificaciones_activas!: boolean;
}
