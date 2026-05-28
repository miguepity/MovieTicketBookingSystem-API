import { ApiProperty } from '@nestjs/swagger';

export class CreateCiudadesDto {
  @ApiProperty({
    description: 'Nombre único de la ciudad',
    example: 'Guatemala',
  })
  nombre!: string;
}
