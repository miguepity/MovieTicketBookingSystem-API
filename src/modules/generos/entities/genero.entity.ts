import { ApiProperty } from '@nestjs/swagger';

export class Genero {
  @ApiProperty({ description: 'Identificador del género', example: '1' })
  id!: bigint;

  @ApiProperty({ description: 'Nombre del género', example: 'Acción' })
  nombre!: string;
}
