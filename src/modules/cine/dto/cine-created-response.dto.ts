import { ApiProperty } from '@nestjs/swagger';

export class CineCreatedResponseDto {
  @ApiProperty({
    description: 'ID del cine creado',
    type: String,
    example: '1',
  })
  id!: bigint;
}
