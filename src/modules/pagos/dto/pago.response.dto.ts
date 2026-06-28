import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ──── crear / crearEfectivo ──────────────────────────────────────────────────

export class PagoCreatedResponseDto {
  @ApiProperty({ type: String, example: '42' })
  id_pago!: string;

  @ApiProperty({ type: String, example: 'exitoso' })
  estado!: string;

  @ApiProperty({ type: String, example: '25.00' })
  monto_original!: string;

  @ApiProperty({ type: String, example: '5.00' })
  monto_descuento!: string;

  @ApiProperty({ type: String, example: '20.00' })
  monto_final!: string;

  @ApiProperty({ type: String, example: 'RES-2026-000123' })
  numero_reserva!: string;
}

// ──── Admin row ──────────────────────────────────────────────────────────────

export class ClientePagoDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ type: String, example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ type: String, example: 'juan@example.com' })
  email!: string;
}

export class CineRefPagoDto {
  @ApiProperty({ type: String, example: '2' })
  id!: string;

  @ApiProperty({ type: String, example: 'Cine Metropolis' })
  nombre!: string;
}

export class CiudadRefPagoDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ type: String, example: 'Bogotá' })
  nombre!: string;
}

export class CuponPagoDto {
  @ApiProperty({ type: String, example: '3' })
  id!: string;

  @ApiProperty({ type: String, example: 'DESCUENTO20' })
  codigo!: string;

  @ApiProperty({ type: String, example: 'porcentaje' })
  tipo!: string;

  @ApiProperty({ type: String, example: '20.00' })
  valor!: string;
}

export class AdminPagoRowDto {
  @ApiProperty({ type: String, example: '42' })
  id!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'TRX123456789' })
  referencia_externa!: string | null;

  @ApiProperty({ type: String, example: 'RES-2026-000123' })
  numero_reserva!: string;

  @ApiProperty({ type: () => ClientePagoDto })
  cliente!: ClientePagoDto;

  @ApiProperty({ type: () => CineRefPagoDto })
  cine!: CineRefPagoDto;

  @ApiPropertyOptional({ type: () => CiudadRefPagoDto, nullable: true })
  ciudad!: CiudadRefPagoDto | null;

  @ApiProperty({ type: String, example: 'tarjeta' })
  metodo!: string;

  @ApiProperty({ type: String, example: '25.00' })
  monto_original!: string;

  @ApiProperty({ type: String, example: '0.00' })
  monto_descuento!: string;

  @ApiProperty({ type: String, example: '25.00' })
  monto_final!: string;

  @ApiProperty({ type: String, example: 'exitoso' })
  estado!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: '4242' })
  ultimos4_snapshot!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'VISA' })
  marca_snapshot!: string | null;

  @ApiPropertyOptional({ type: () => CuponPagoDto, nullable: true })
  cupon!: CuponPagoDto | null;

  @ApiProperty({ type: String, example: '10' })
  id_reserva!: string;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-06-25T14:30:00.000Z' })
  created_at!: string;
}

export class AdminPagoPageResponseDto {
  @ApiProperty({ type: () => AdminPagoRowDto, isArray: true })
  @Type(() => AdminPagoRowDto)
  data!: AdminPagoRowDto[];

  @ApiProperty({ type: Number, example: 100 })
  total!: number;

  @ApiProperty({ type: Number, example: 1 })
  page!: number;

  @ApiProperty({ type: Number, example: 20 })
  limit!: number;
}
