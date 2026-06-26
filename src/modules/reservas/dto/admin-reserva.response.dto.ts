import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ──── Sub-DTOs ────────────────────────────────────────────────────────────────

export class AdminReservaClienteDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ type: String, example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ type: String, example: 'juan@example.com' })
  email!: string;
}

export class AdminReservaAsientoRowDto {
  @ApiProperty({ type: String, example: 'A12' })
  codigo!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'VIP' })
  tipo!: string | null;
}

// ──── Shape returned by toAdminReservaRow() (used in findAdminPaginated) ──────
// {
//   id, numero_reserva, estado, created_at,
//   cliente: { id, nombre, email },
//   funcion: { id, fecha_hora },
//   pelicula: { id, titulo },
//   cine: { id, nombre },
//   sala: { id, nombre },
//   num_asientos,
//   asientos: [{ codigo, tipo }]
// }

export class AdminReservaFuncionRefDto {
  @ApiProperty({ type: String, example: '5' })
  id!: string;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-30T20:00:00.000Z' })
  fecha_hora!: Date;
}

export class AdminReservaPeliculaRefDto {
  @ApiProperty({ type: String, example: '3' })
  id!: string;

  @ApiProperty({ type: String, example: 'Dune: Part Two' })
  titulo!: string;
}

export class AdminReservaCineRefDto {
  @ApiProperty({ type: String, example: '2' })
  id!: string;

  @ApiProperty({ type: String, example: 'Cine Metropolis' })
  nombre!: string;
}

export class AdminReservaSalaRefDto {
  @ApiProperty({ type: String, example: '4' })
  id!: string;

  @ApiProperty({ type: String, example: 'Sala 1 IMAX' })
  nombre!: string;
}

export class AdminReservaRowDto {
  @ApiProperty({ type: String, example: '42' })
  id!: string;

  @ApiProperty({ type: String, example: 'RES-20260625-ABCDE' })
  numero_reserva!: string;

  @ApiProperty({ type: String, example: 'pagada' })
  estado!: string;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-25T10:00:00.000Z' })
  created_at!: Date;

  @ApiProperty({ type: () => AdminReservaClienteDto })
  cliente!: AdminReservaClienteDto;

  @ApiProperty({ type: () => AdminReservaFuncionRefDto })
  funcion!: AdminReservaFuncionRefDto;

  @ApiProperty({ type: () => AdminReservaPeliculaRefDto })
  pelicula!: AdminReservaPeliculaRefDto;

  @ApiProperty({ type: () => AdminReservaCineRefDto })
  cine!: AdminReservaCineRefDto;

  @ApiProperty({ type: () => AdminReservaSalaRefDto })
  sala!: AdminReservaSalaRefDto;

  @ApiProperty({ type: Number, example: 2 })
  num_asientos!: number;

  @ApiProperty({ type: () => AdminReservaAsientoRowDto, isArray: true })
  @Type(() => AdminReservaAsientoRowDto)
  asientos!: AdminReservaAsientoRowDto[];
}

// ──── Paginated wrapper ───────────────────────────────────────────────────────

export class AdminReservasPageResponseDto {
  @ApiProperty({ type: () => AdminReservaRowDto, isArray: true })
  @Type(() => AdminReservaRowDto)
  data!: AdminReservaRowDto[];

  @ApiProperty({ type: Number, example: 150 })
  total!: number;

  @ApiProperty({ type: Number, example: 1 })
  page!: number;

  @ApiProperty({ type: Number, example: 20 })
  limit!: number;
}

// ──── Shape returned by findOneAdmin() ───────────────────────────────────────
// {
//   id, numero_reserva, estado, monto_total, created_at, updated_at,
//   cliente: { id, nombre, email },
//   funcion: {
//     id, fecha_hora,
//     pelicula: { id, titulo, poster_url },
//     sala: { id, nombre },
//     cine: { id, nombre }
//   },
//   asientos: [{ id, codigo, fila, columna, tipo }],
//   pago: { id, monto_final, metodo, estado, created_at } | null
// }

export class AdminReservaDetailAsientoDto {
  @ApiProperty({ type: String, example: '12' })
  id!: string;

  @ApiProperty({ type: String, example: 'A12' })
  codigo!: string;

  @ApiProperty({ type: String, example: 'A' })
  fila!: string;

  @ApiProperty({ type: Number, example: 12 })
  columna!: number;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'VIP' })
  tipo!: string | null;
}

export class AdminReservaDetailPeliculaDto {
  @ApiProperty({ type: String, example: '3' })
  id!: string;

  @ApiProperty({ type: String, example: 'Dune: Part Two' })
  titulo!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'https://example.com/poster.jpg' })
  poster_url!: string | null;
}

export class AdminReservaDetailSalaDto {
  @ApiProperty({ type: String, example: '4' })
  id!: string;

  @ApiProperty({ type: String, example: 'Sala 1 IMAX' })
  nombre!: string;
}

export class AdminReservaDetailCineDto {
  @ApiProperty({ type: String, example: '2' })
  id!: string;

  @ApiProperty({ type: String, example: 'Cine Metropolis' })
  nombre!: string;
}

export class AdminReservaDetailFuncionDto {
  @ApiProperty({ type: String, example: '5' })
  id!: string;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-30T20:00:00.000Z' })
  fecha_hora!: Date;

  @ApiProperty({ type: () => AdminReservaDetailPeliculaDto })
  pelicula!: AdminReservaDetailPeliculaDto;

  @ApiProperty({ type: () => AdminReservaDetailSalaDto })
  sala!: AdminReservaDetailSalaDto;

  @ApiProperty({ type: () => AdminReservaDetailCineDto })
  cine!: AdminReservaDetailCineDto;
}

export class AdminReservaDetailPagoDto {
  @ApiProperty({ type: String, example: '99' })
  id!: string;

  @ApiProperty({ type: String, example: '25.00' })
  monto_final!: string;

  @ApiProperty({ type: String, example: 'tarjeta' })
  metodo!: string;

  @ApiProperty({ type: String, example: 'exitoso' })
  estado!: string;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-25T10:05:00.000Z' })
  created_at!: Date;
}

export class AdminReservaDetailResponseDto {
  @ApiProperty({ type: String, example: '42' })
  id!: string;

  @ApiProperty({ type: String, example: 'RES-20260625-ABCDE' })
  numero_reserva!: string;

  @ApiProperty({ type: String, example: 'pagada' })
  estado!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: '25.00' })
  monto_total!: string | null;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-25T10:00:00.000Z' })
  created_at!: Date;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-25T10:05:00.000Z' })
  updated_at!: Date;

  @ApiProperty({ type: () => AdminReservaClienteDto })
  cliente!: AdminReservaClienteDto;

  @ApiProperty({ type: () => AdminReservaDetailFuncionDto })
  funcion!: AdminReservaDetailFuncionDto;

  @ApiProperty({ type: () => AdminReservaDetailAsientoDto, isArray: true })
  @Type(() => AdminReservaDetailAsientoDto)
  asientos!: AdminReservaDetailAsientoDto[];

  @ApiPropertyOptional({ type: () => AdminReservaDetailPagoDto, nullable: true })
  pago!: AdminReservaDetailPagoDto | null;
}

// ──── Shape returned by cancelarAdminReserva() ───────────────────────────────
// {
//   reserva: { id, numero_reserva, estado, fecha_cancelacion },
//   reembolso: { id, estado, monto } | null
// }

export class AdminCancelarReservaDto {
  @ApiProperty({ type: String, example: '42' })
  id!: string;

  @ApiProperty({ type: String, example: 'RES-20260625-ABCDE' })
  numero_reserva!: string;

  @ApiProperty({ type: String, example: 'cancelada' })
  estado!: string;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-25T14:30:00.000Z' })
  fecha_cancelacion!: string;
}

export class AdminCancelarReembolsoDto {
  @ApiProperty({ type: String, example: '7' })
  id!: string;

  @ApiProperty({ type: String, example: 'PENDIENTE' })
  estado!: string;

  @ApiProperty({ type: String, example: '12.50' })
  monto!: string;
}

export class AdminCancelarReservaResponseDto {
  @ApiProperty({ type: () => AdminCancelarReservaDto })
  reserva!: AdminCancelarReservaDto;

  @ApiPropertyOptional({ type: () => AdminCancelarReembolsoDto, nullable: true })
  reembolso!: AdminCancelarReembolsoDto | null;
}
