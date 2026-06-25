import { ApiProperty } from '@nestjs/swagger';

export class ReporteCineDto {
  @ApiProperty({
    description: 'ID del cine',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Nombre del cine',
    example: 'Cinépolis Plaza Mayor',
  })
  nombre!: string;
}
