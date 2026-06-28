import { ApiProperty } from '@nestjs/swagger';

/**
 * Per-seat shape nested inside `ClienteDetalleReservaDto`.
 * Matches: { id, codigo }
 */
export class ClienteReservaAsientoDto {
  @ApiProperty({ description: 'ID del asiento', example: '5' })
  id!: string;

  @ApiProperty({ description: 'Código del asiento', example: 'A1' })
  codigo!: string;
}

/**
 * Per-reservation shape nested inside `ClienteDetalleResponseDto.reservas`.
 * Matches the runtime output of the reservas map in `UsersService.findClienteById`:
 * id, numero_reserva, estado, created_at, pelicula, fecha_hora,
 * num_asientos, asientos[], monto_total.
 */
export class ClienteDetalleReservaDto {
  @ApiProperty({ description: 'ID de la reserva', example: '42' })
  id!: string;

  @ApiProperty({ description: 'Número de reserva', example: 'RES-0042' })
  numero_reserva!: string;

  @ApiProperty({ description: 'Estado de la reserva', example: 'confirmada' })
  estado!: string;

  @ApiProperty({
    description: 'Fecha de creación de la reserva',
    example: '2026-03-15T20:00:00.000Z',
    format: 'date-time',
  })
  created_at!: string;

  @ApiProperty({
    description: 'Título de la película (null si no existe)',
    example: 'Dune: Part Two',
    nullable: true,
  })
  pelicula!: string | null;

  @ApiProperty({
    description: 'Fecha y hora de la función',
    example: '2026-03-20T19:30:00.000Z',
    format: 'date-time',
  })
  fecha_hora!: string;

  @ApiProperty({ description: 'Número de asientos reservados', example: 2 })
  num_asientos!: number;

  @ApiProperty({
    type: ClienteReservaAsientoDto,
    isArray: true,
    description: 'Asientos reservados',
  })
  asientos!: ClienteReservaAsientoDto[];

  @ApiProperty({
    description: 'Monto total de la reserva (pagado o calculado)',
    example: 120.0,
  })
  monto_total!: number;
}

/**
 * Detailed response for `GET /admin/clientes/{id}`.
 * Matches the runtime output of `UsersService.findClienteById`:
 * flat cliente fields + last 10 reservations.
 */
export class ClienteDetalleResponseDto {
  @ApiProperty({ description: 'ID del cliente', example: '1' })
  id!: string;

  @ApiProperty({ description: 'Nombre completo', example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ description: 'Email del cliente', example: 'juan@email.com' })
  email!: string;

  @ApiProperty({
    description: 'Teléfono del cliente (puede ser null)',
    example: '+502 5555-0001',
    nullable: true,
    required: false,
  })
  telefono!: string | null;

  @ApiProperty({ description: 'Estado del cliente', example: 'activo' })
  estado!: string;

  @ApiProperty({
    description: 'Si el cliente recibe notificaciones',
    example: true,
  })
  notificaciones_activas!: boolean;

  @ApiProperty({
    description: 'Total de reservas del cliente (histórico completo)',
    example: 12,
  })
  num_reservas!: number;

  @ApiProperty({
    description: 'Fecha de creación del cliente',
    example: '2026-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  created_at!: string;

  @ApiProperty({
    type: ClienteDetalleReservaDto,
    isArray: true,
    description: 'Últimas 10 reservas del cliente',
  })
  reservas!: ClienteDetalleReservaDto[];
}
