import { ApiProperty } from '@nestjs/swagger';

export class DesactivarPoliticaResponseDto {
  @ApiProperty({
    description: 'ID de la política desactivada',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Estado de activación tras la operación (siempre false)',
    type: Boolean,
    example: false,
  })
  activa!: boolean;
}
