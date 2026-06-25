import { ApiProperty } from '@nestjs/swagger';

export class SalaListItemResponseDto {
  @ApiProperty({
    description: 'ID de la sala',
    type: String,
    example: '1',
  })
  id!: number;

  @ApiProperty({
    description: 'Nombre de la sala',
    example: 'Sala 1',
  })
  nombre!: string;
}
