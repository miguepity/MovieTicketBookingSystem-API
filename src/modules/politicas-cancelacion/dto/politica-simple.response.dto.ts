import { ApiProperty } from '@nestjs/swagger';

/**
 * Minimal shape returned by listByCine and setActiva (plain Prisma PoliticaCancelacion row).
 */
export class PoliticaSimpleResponseDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ type: String, example: '2' })
  id_cine!: string;

  @ApiProperty({ type: String, example: 'Política Cine A 2026' })
  nombre!: string;

  @ApiProperty({ type: Boolean, example: true })
  activa!: boolean;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-01T00:00:00.000Z' })
  created_at!: string;

  @ApiProperty({ type: String, format: 'date-time', nullable: true, example: null })
  updated_at!: string | null;
}
