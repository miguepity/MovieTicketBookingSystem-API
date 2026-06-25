import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AsientoDto } from './asiento.dto';

export class CancelacionEmailDto {
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
    description: 'Número de reserva cancelada',
    example: 'RES-123456',
  })
  numeroReserva!: string;

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
    description: 'Fecha y hora de la función cancelada',
    example: '2026-06-25T19:30:00Z',
    format: 'date-time',
  })
  fechaFuncion!: string;

  @ApiProperty({
    description: 'Lista de asientos que fueron cancelados',
    type: () => AsientoDto,
    isArray: true,
    example: [{ codigo: 'A1', tipo: 'Estándar' }],
  })
  asientos!: AsientoDto[];

  @ApiPropertyOptional({
    description: 'Monto que fue pagado originalmente',
    example: '90.00',
  })
  montoPagado?: string;

  @ApiProperty({
    description: 'Estado del reembolso (Aprobado, Pendiente, etc.)',
    example: 'Aprobado',
  })
  estadoReembolso!: string;

  @ApiPropertyOptional({
    description: 'Monto del reembolso procesado',
    example: '90.00',
  })
  montoReembolso?: string;
}
