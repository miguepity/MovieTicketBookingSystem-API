import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard response shape for DELETE endpoints.
 * Returns the id of the deleted resource (stringified BigInt).
 */
export class DeleteResponseDto {
  @ApiProperty({
    description: 'ID del recurso eliminado',
    example: '1',
  })
  id!: string;
}
