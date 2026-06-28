import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ──── me/reembolsos row ──────────────────────────────────────────────────────

export class MiReembolsoResponseDto {
  @ApiProperty({ type: String, example: '7' })
  id!: string;

  @ApiProperty({ type: String, example: 'RES-2026-000123' })
  numero_reserva!: string;

  @ApiProperty({ type: String, example: '15.00' })
  monto!: string;

  @ApiProperty({ type: String, example: 'PENDIENTE' })
  estado!: string;

  @ApiProperty({ type: String, example: '50.00' })
  porcentaje_aplicado!: string;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  fecha_procesado!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  motivo_rechazo!: string | null;
}

// ──── Admin row ──────────────────────────────────────────────────────────────

export class ClienteReembolsoDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ type: String, example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ type: String, example: 'juan@example.com' })
  email!: string;
}

export class PeliculaReembolsoDto {
  @ApiProperty({ type: String, example: '5' })
  id!: string;

  @ApiProperty({ type: String, example: 'Dune: Part Two' })
  titulo!: string;
}

export class CineReembolsoDto {
  @ApiProperty({ type: String, example: '2' })
  id!: string;

  @ApiProperty({ type: String, example: 'Cine Metropolis' })
  nombre!: string;
}

export class PoliticaReembolsoDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ type: String, example: 'Política Cine A 2026' })
  nombre!: string;
}

export class AdminReembolsoRowDto {
  @ApiProperty({ type: String, example: '7' })
  id!: string;

  @ApiProperty({ type: String, example: 'RES-2026-000123' })
  numero_reserva!: string;

  @ApiProperty({ type: () => ClienteReembolsoDto })
  cliente!: ClienteReembolsoDto;

  @ApiProperty({ type: () => PeliculaReembolsoDto })
  pelicula!: PeliculaReembolsoDto;

  @ApiProperty({ type: () => CineReembolsoDto })
  cine!: CineReembolsoDto;

  @ApiProperty({ type: String, example: 'tarjeta' })
  metodo_pago_original!: string;

  @ApiProperty({ type: String, example: '15.00' })
  monto!: string;

  @ApiProperty({ type: String, example: '50.00' })
  porcentaje_aplicado!: string;

  @ApiPropertyOptional({ type: () => PoliticaReembolsoDto, nullable: true })
  politica!: PoliticaReembolsoDto | null;

  @ApiProperty({ type: Number, example: 2 })
  dias_en_cola!: number;

  @ApiProperty({ type: String, example: 'PENDIENTE' })
  estado!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  motivo_rechazo!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nota!: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  fecha_procesado!: string | null;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-25T14:30:00.000Z' })
  created_at!: string;
}

export class AdminReembolsoPageResponseDto {
  @ApiProperty({ type: () => AdminReembolsoRowDto, isArray: true })
  @Type(() => AdminReembolsoRowDto)
  data!: AdminReembolsoRowDto[];

  @ApiProperty({ type: Number, example: 50 })
  total!: number;

  @ApiProperty({ type: Number, example: 1 })
  page!: number;

  @ApiProperty({ type: Number, example: 20 })
  limit!: number;
}

// ──── procesar ───────────────────────────────────────────────────────────────

export class ProcesarReembolsoResponseDto {
  @ApiProperty({ type: String, example: '7' })
  id!: string;

  @ApiProperty({ type: String, example: 'PROCESADO' })
  estado!: string;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  fecha_procesado!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nota!: string | null;
}

// ──── rechazar ───────────────────────────────────────────────────────────────

export class RechazarReembolsoResponseDto {
  @ApiProperty({ type: String, example: '7' })
  id!: string;

  @ApiProperty({ type: String, example: 'RECHAZADO' })
  estado!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  motivo_rechazo!: string | null;
}

// ──── KPIs ───────────────────────────────────────────────────────────────────

export class ReembolsosKpisResponseDto {
  @ApiProperty({ type: Number, example: 5, description: 'Reembolsos en estado PENDIENTE' })
  pendientes!: number;

  @ApiProperty({ type: Number, example: 5, description: 'Alias de pendientes (igual a pendientes)' })
  en_procesamiento!: number;

  @ApiProperty({ type: String, example: '75.00', description: 'Suma de montos pendientes de reembolso' })
  monto_pendiente!: string;

  @ApiProperty({ type: Number, example: 12, description: 'Reembolsos completados en los últimos 30 días' })
  completados_30d!: number;
}
