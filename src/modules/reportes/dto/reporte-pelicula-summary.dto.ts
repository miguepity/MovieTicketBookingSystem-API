import { ApiProperty } from '@nestjs/swagger';

export class ReportePeliculaDto {
  @ApiProperty({
    description: 'ID de la película',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Título de la película',
    example: 'Spider-Man: No Way Home',
  })
  titulo!: string;
}
