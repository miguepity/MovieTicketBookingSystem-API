import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ──── Shape returned by ReservasService.toBoletoView() ───────────────────────
// Used by: findMisReservas() and findOneByNumero()
//
// BoletoView {
//   id, numero_reserva, estado, created_at, id_funcion, fecha_hora,
//   pelicula: { id, titulo, poster_url, rating_promedio, rating_count },
//   sala: { id, nombre },
//   cine: { id, nombre },
//   asientos: [{ id, codigo, fila, columna, tipo_asiento, precio }],
//   monto_total, ultimos4_snapshot, marca_snapshot
// }

export class BoletoAsientoDto {
  @ApiProperty({ type: String, example: '12' })
  id!: string;

  @ApiProperty({ type: String, example: 'A12' })
  codigo!: string;

  @ApiProperty({ type: String, example: 'A' })
  fila!: string;

  @ApiProperty({ type: Number, example: 12 })
  columna!: number;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'VIP' })
  tipo_asiento!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: '12.50' })
  precio!: string | null;
}

export class BoletoPeliculaDto {
  @ApiProperty({ type: String, example: '3' })
  id!: string;

  @ApiProperty({ type: String, example: 'Dune: Part Two' })
  titulo!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'https://example.com/poster.jpg' })
  poster_url!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: '8.50' })
  rating_promedio!: string | null;

  @ApiProperty({ type: Number, example: 1240 })
  rating_count!: number;
}

export class BoletoSalaDto {
  @ApiProperty({ type: String, example: '2' })
  id!: string;

  @ApiProperty({ type: String, example: 'Sala 1 IMAX' })
  nombre!: string;
}

export class BoletoCineDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ type: String, example: 'Cine Metropolis' })
  nombre!: string;
}

export class BoletoResponseDto {
  @ApiProperty({ type: String, example: '42' })
  id!: string;

  @ApiProperty({ type: String, example: 'RES-20260625-ABCDE' })
  numero_reserva!: string;

  @ApiProperty({ type: String, example: 'pagada' })
  estado!: string;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-25T10:00:00.000Z' })
  created_at!: Date;

  @ApiProperty({ type: String, example: '5' })
  id_funcion!: string;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-30T20:00:00.000Z' })
  fecha_hora!: Date;

  @ApiProperty({ type: () => BoletoPeliculaDto })
  pelicula!: BoletoPeliculaDto;

  @ApiProperty({ type: () => BoletoSalaDto })
  sala!: BoletoSalaDto;

  @ApiProperty({ type: () => BoletoCineDto })
  cine!: BoletoCineDto;

  @ApiProperty({ type: () => BoletoAsientoDto, isArray: true })
  @Type(() => BoletoAsientoDto)
  asientos!: BoletoAsientoDto[];

  @ApiPropertyOptional({ type: String, nullable: true, example: '25.00' })
  monto_total!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: '4242' })
  ultimos4_snapshot!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'VISA' })
  marca_snapshot!: string | null;
}

// ──── Array wrapper (for GET /me/reservas) ───────────────────────────────────

export class BoletoListResponseDto {
  @ApiProperty({ type: () => BoletoResponseDto, isArray: true })
  @Type(() => BoletoResponseDto)
  data!: BoletoResponseDto[];
}
