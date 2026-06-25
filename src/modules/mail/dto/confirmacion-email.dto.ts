import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AsientoDto } from './asiento.dto';

export class ConfirmacionEmailDto {
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
    description: 'Número de reserva único',
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
    description: 'Fecha y hora de la función',
    example: '2026-06-25T19:30:00Z',
    format: 'date-time',
  })
  fechaFuncion!: string;

  @ApiProperty({
    description: 'Lista de asientos reservados',
    type: () => AsientoDto,
    isArray: true,
    example: [{ codigo: 'A1', tipo: 'Estándar' }],
  })
  asientos!: AsientoDto[];

  @ApiProperty({
    description: 'Monto original antes de descuentos',
    example: '100.00',
  })
  montoOriginal!: string;

  @ApiProperty({
    description: 'Monto del descuento aplicado',
    example: '10.00',
  })
  montoDescuento!: string;

  @ApiProperty({
    description: 'Monto final a pagar',
    example: '90.00',
  })
  montoFinal!: string;

  @ApiProperty({
    description: 'Método de pago utilizado',
    example: 'Tarjeta de crédito',
  })
  metodo!: string;
}
