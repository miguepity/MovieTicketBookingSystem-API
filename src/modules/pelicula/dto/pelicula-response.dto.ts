import { ApiProperty } from '@nestjs/swagger';
import { FichaTecnicaDto } from './ficha-tecnica.dto';

export class PeliculaResponseDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ example: 'Inception' })
  titulo!: string;

  @ApiProperty({ example: 'Un ladrón que roba secretos a través de sueños.', nullable: true, required: false })
  sinopsis!: string | null;

  @ApiProperty({ example: 148, nullable: true, required: false })
  duracion_min!: number | null;

  @ApiProperty({ example: '2023-07-16T00:00:00.000Z', format: 'date-time', nullable: true, required: false })
  fecha_estreno!: string | null;

  @ApiProperty({ type: String, example: '1', nullable: true, required: false })
  id_genero!: string | null;

  @ApiProperty({ type: String, example: '1', nullable: true, required: false })
  id_idioma!: string | null;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/movie.jpg', nullable: true, required: false })
  poster_url!: string | null;

  @ApiProperty({ example: true })
  activo!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', format: 'date-time' })
  created_at!: string;

  @ApiProperty({ example: '2026-01-02T00:00:00.000Z', format: 'date-time' })
  updated_at!: string;

  @ApiProperty({ example: null, format: 'date-time', nullable: true, required: false })
  deleted_at!: string | null;

  @ApiProperty({ example: '1', nullable: true, required: false })
  id_usuario!: string;

  @ApiProperty({ required: false, example: 'Tu mente es la escena del crimen.' })
  tagline?: string | null;

  @ApiProperty({ required: false, type: FichaTecnicaDto, nullable: true })
  ficha_tecnica?: FichaTecnicaDto | null;

  @ApiProperty({ required: false, example: 4.2, nullable: true })
  rating_promedio?: number | null;

  @ApiProperty({ example: 187 })
  rating_count!: number;

  @ApiProperty({ required: false, example: 5, nullable: true })
  mi_calificacion?: number | null;

  @ApiProperty({
    example: true,
    description:
      'true si la película está disponible para reservar (fecha_estreno <= próximo domingo 23:59). false si es próximamente.',
  })
  puede_reservar!: boolean;
}
