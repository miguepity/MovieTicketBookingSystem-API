import { ApiProperty } from '@nestjs/swagger';

export class AsientosDisponibilidadDto {
  @ApiProperty({ example: 120 })
  total!: number;

  @ApiProperty({ example: 80 })
  disponibles!: number;

  @ApiProperty({ example: 5 })
  bloqueados!: number;

  @ApiProperty({ example: 10 })
  reservados!: number;

  @ApiProperty({ example: 25 })
  ocupados!: number;
}

export class SalaResumenDto {
  @ApiProperty({ type: String, example: '3' })
  id!: string;

  @ApiProperty({ example: 'Sala 3 IMAX' })
  nombre!: string;
}

export class FuncionConDisponibilidadDto {
  @ApiProperty({ type: String, example: '42' })
  id!: string;

  @ApiProperty({ example: '2026-07-01T20:30:00.000Z', format: 'date-time' })
  fecha_hora!: string;

  @ApiProperty({ example: 'programada' })
  estado!: string;

  @ApiProperty({ type: SalaResumenDto })
  sala!: SalaResumenDto;

  @ApiProperty({ type: AsientosDisponibilidadDto })
  asientos!: AsientosDisponibilidadDto;
}

export class PeliculaResumenDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ example: 'Inception' })
  titulo!: string;
}

export class CineResumenDto {
  @ApiProperty({ type: String, example: '5' })
  id!: string;

  @ApiProperty({ example: 'Cinépolis Plaza Mayor' })
  nombre!: string;
}

export class FuncionesPorCineResponseDto {
  @ApiProperty({ type: PeliculaResumenDto })
  pelicula!: PeliculaResumenDto;

  @ApiProperty({ type: CineResumenDto })
  cine!: CineResumenDto;

  @ApiProperty({ type: FuncionConDisponibilidadDto, isArray: true })
  funciones!: FuncionConDisponibilidadDto[];
}
