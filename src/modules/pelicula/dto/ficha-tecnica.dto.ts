import { ApiProperty } from '@nestjs/swagger';

export class FichaTecnicaDto {
  @ApiProperty({ required: false, example: 'Christopher Nolan' })
  direccion?: string;

  @ApiProperty({ required: false, example: 'Christopher Nolan' })
  guion?: string;

  @ApiProperty({ required: false, example: 'Wally Pfister' })
  fotografia?: string;

  @ApiProperty({ required: false, type: [String], example: ['Leonardo DiCaprio', 'Marion Cotillard'] })
  reparto?: string[];

  @ApiProperty({ required: false, example: 'Hans Zimmer' })
  musica?: string;

  @ApiProperty({ required: false, example: 'USA' })
  pais?: string;

  @ApiProperty({ required: false, example: 'Warner Bros' })
  productora?: string;

  @ApiProperty({ required: false, example: 'Warner Bros Distribution' })
  distribuidor?: string;
}
