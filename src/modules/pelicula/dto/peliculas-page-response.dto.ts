import { ApiProperty } from '@nestjs/swagger';
import { PeliculaResponseDto } from './pelicula-response.dto';

export class PeliculasPageResponseDto {
  @ApiProperty({ type: PeliculaResponseDto, isArray: true })
  data!: PeliculaResponseDto[];

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;
}
