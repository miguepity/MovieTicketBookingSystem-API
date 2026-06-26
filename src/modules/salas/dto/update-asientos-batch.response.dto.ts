import { ApiProperty } from '@nestjs/swagger';

export class UpdateAsientosBatchResponseDto {
  @ApiProperty({ example: 15, description: 'Número de asientos actualizados' })
  updated!: number;

  @ApiProperty({
    example: 'La sala tiene 2 funciones con reservas activas. Los cambios solo afectan reservas futuras.',
    nullable: true,
    required: false,
  })
  warning?: string;
}
