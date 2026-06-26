import { ApiProperty } from '@nestjs/swagger';

/**
 * Generic single-message response shape.
 * Used by endpoints that confirm an action via a human-readable string.
 */
export class MessageResponseDto {
  @ApiProperty({
    description: 'Mensaje confirmando la operación',
    example: 'Operación completada exitosamente',
  })
  message!: string;
}
