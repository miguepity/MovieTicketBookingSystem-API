import { ApiProperty } from '@nestjs/swagger';

export class RolResponseDto {
  @ApiProperty({ description: 'ID del rol', type: String, example: '1' })
  id!: string;

  @ApiProperty({ description: 'Nombre del rol', example: 'admin' })
  nombre!: string;
}
