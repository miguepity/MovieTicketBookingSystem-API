import { ApiProperty } from '@nestjs/swagger';

export class Idioma {
  @ApiProperty({ description: 'Identificador del idioma', example: '1' })
  id!: bigint;

  @ApiProperty({ description: 'Nombre del idioma', example: 'Español' })
  nombre!: string;
}
