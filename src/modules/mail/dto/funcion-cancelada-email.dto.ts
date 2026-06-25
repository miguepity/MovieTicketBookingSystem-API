import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FuncionCanceladaEmailDto {
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
    description: 'Título de la película',
    example: 'Avatar',
  })
  pelicula!: string;

  @ApiProperty({
    description: 'Nombre del cine',
    example: 'Cinemark Centro',
  })
  cine!: string;

  @ApiProperty({
    description: 'Fecha y hora de la función que fue cancelada',
    example: '2026-06-25T19:30:00Z',
    format: 'date-time',
  })
  fechaFuncion!: string;

  @ApiProperty({
    description: 'Número de reserva afectada',
    example: 'RES-123456',
  })
  numeroReserva!: string;

  @ApiProperty({
    description: 'Indica si hay pago aprobado a procesar',
    example: true,
    type: Boolean,
  })
  tienePagoAprobado!: boolean;

  @ApiPropertyOptional({
    description: 'Monto pagado que será reembolsado',
    example: '90.00',
  })
  montoPagado?: string;
}
