import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for GET /cine/:id
 * Matches the raw Prisma Cines record returned by CineService.findOne():
 *   { id, nombre, direccion, id_ciudad, activo, created_at }
 * (No nested salas — use GET /salas?id_cine=:id for that.)
 */
export class CineDetailResponseDto {
  @ApiProperty({
    description: 'ID del cine',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Nombre del cine',
    example: 'Cinépolis Plaza Mayor',
    maxLength: 150,
  })
  nombre!: string;

  @ApiPropertyOptional({
    description: 'Dirección física del cine',
    example: 'Av. Principal 123, Ciudad de México',
    nullable: true,
  })
  direccion!: string | null;

  @ApiProperty({
    description: 'ID de la ciudad',
    type: String,
    example: '1',
  })
  id_ciudad!: string;

  @ApiProperty({
    description: 'Si el cine está activo',
    example: true,
  })
  activo!: boolean;

  @ApiProperty({
    description: 'Fecha de creación del cine',
    type: String,
    format: 'date-time',
    example: '2026-01-15T10:30:00.000Z',
  })
  created_at!: string;
}
