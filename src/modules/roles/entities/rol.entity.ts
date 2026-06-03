import { ApiProperty } from '@nestjs/swagger';

export class Rol {
  @ApiProperty({ description: 'Identificador del rol', example: '1' })
  id!: bigint;

  @ApiProperty({ description: 'Nombre del rol', example: 'admin' })
  nombre!: string;
}
