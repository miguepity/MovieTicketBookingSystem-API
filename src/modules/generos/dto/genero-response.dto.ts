import { ApiProperty } from '@nestjs/swagger';

export class GeneroResponseDto {
  @ApiProperty({ description: 'ID del género', type: String, example: '1' })
  id!: string;

  @ApiProperty({ description: 'Nombre del género', example: 'Acción' })
  nombre!: string;
}
