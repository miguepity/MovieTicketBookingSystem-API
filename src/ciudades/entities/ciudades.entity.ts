import { ApiProperty } from '@nestjs/swagger';

export class Ciudad {
  @ApiProperty({ description: 'Identificador de la ciudad', example: '1' })
  id!: bigint;

  @ApiProperty({ description: 'Nombre de la ciudad', example: 'Guatemala' })
  nombre!: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-05-26T12:00:00.000Z',
  })
  created_at!: Date;
}
