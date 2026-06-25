import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NuevaPeliculaEmailDto {
  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan Pérez',
  })
  nombre!: string;

  @ApiProperty({
    description: 'Email del cliente',
    example: 'juan@example.com',
    format: 'email',
  })
  email!: string;

  @ApiProperty({
    description: 'Título de la nueva película',
    example: 'Avatar',
  })
  titulo!: string;

  @ApiProperty({
    description: 'Género de la película',
    example: 'Ciencia Ficción',
  })
  genero!: string;

  @ApiProperty({
    description: 'Fecha de estreno de la película',
    example: '2026-07-01T00:00:00Z',
    format: 'date-time',
  })
  fechaEstreno!: string;

  @ApiPropertyOptional({
    description: 'URL del póster de la película',
    example: 'https://example.com/posters/avatar.jpg',
  })
  posterUrl?: string;

  @ApiProperty({
    description: 'Link para acceder a más información o comprar entradas',
    example: 'https://cines.example.com/peliculas/avatar',
  })
  link!: string;
}
