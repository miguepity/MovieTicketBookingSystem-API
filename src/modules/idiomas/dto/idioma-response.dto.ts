import { ApiProperty } from '@nestjs/swagger';

export class IdiomaResponseDto {
  @ApiProperty({ description: 'ID del idioma', type: String, example: '1' })
  id!: string;

  @ApiProperty({ description: 'Nombre del idioma', example: 'Español' })
  nombre!: string;
}
