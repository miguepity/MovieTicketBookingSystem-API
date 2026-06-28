import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * GET /funciones and GET /funciones/:id both return the raw Prisma Funciones
 * record with embedded relations.  findAll() includes peliculas + salas;
 * findOne() additionally includes asientosFuncions.
 */
export class FuncionResponseDto {
  @ApiProperty({ example: '1', type: String })
  id!: string;

  @ApiProperty({ example: '1', type: String })
  id_pelicula!: string;

  @ApiProperty({ example: '1', type: String })
  id_sala!: string;

  @ApiProperty({
    example: '2026-12-01T19:00:00.000Z',
    format: 'date-time',
    type: String,
  })
  fecha_hora!: string;

  @ApiProperty({ example: 'programada' })
  estado!: string;

  @ApiProperty({
    example: '2026-01-01T00:00:00.000Z',
    format: 'date-time',
    type: String,
  })
  created_at!: string;

  /**
   * Embedded Peliculas record (present because service uses include: { peliculas: true }).
   * Contains all Peliculas columns (titulo, sinopsis, poster_url, etc.).
   */
  @ApiPropertyOptional({
    description: 'Película asociada (Prisma include)',
    type: 'object',
    additionalProperties: true,
    example: { id: '1', titulo: 'Inception', duracion_min: 148 },
  })
  peliculas?: Record<string, unknown>;

  /**
   * Embedded Salas record (present because service uses include: { salas: true }).
   * Contains all Salas columns (nombre, filas, columnas, etc.).
   */
  @ApiPropertyOptional({
    description: 'Sala asociada (Prisma include)',
    type: 'object',
    additionalProperties: true,
    example: { id: '1', nombre: 'Sala 1', filas: 10, columnas: 15 },
  })
  salas?: Record<string, unknown>;

  /**
   * AsientosFuncion array (only present on GET /funciones/:id, not on list).
   */
  @ApiPropertyOptional({
    description: 'Estado de asientos para esta función (solo en detalle)',
    type: 'array',
    items: { type: 'object', additionalProperties: true },
  })
  asientosFuncions?: Record<string, unknown>[];
}

export class FuncionConflictDto {
  @ApiProperty({ example: '1', type: String })
  id!: string;

  @ApiProperty({
    example: '2026-12-01T19:00:00.000Z',
    format: 'date-time',
    type: String,
  })
  fecha_hora!: string;

  @ApiProperty({
    example: '2026-12-01T21:00:00.000Z',
    format: 'date-time',
    type: String,
  })
  fecha_hora_fin!: string;

  @ApiProperty({
    type: 'object',
    properties: { titulo: { type: 'string', example: 'Inception' } },
  })
  pelicula!: { titulo: string };
}
