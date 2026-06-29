import { ApiProperty } from '@nestjs/swagger';
import { ReporteFuncionDto } from './reporte-funcion-summary.dto';
import { ReporteUsuarioDto } from './reporte-usuario-summary.dto';

export class ReportesReservasListItemResponseDto {
  @ApiProperty({
    description: 'ID de la reserva',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Número de reserva legible',
    example: 'RES-20260625-0001',
  })
  numeroReserva!: string;

  @ApiProperty({
    description: 'Estado actual de la reserva',
    example: 'CONFIRMADA',
  })
  estado!: string;

  @ApiProperty({
    description: 'Usuario que realizó la reserva',
    type: () => ReporteUsuarioDto,
  })
  usuario!: ReporteUsuarioDto;

  @ApiProperty({
    description: 'Función para la que se realizó la reserva',
    type: () => ReporteFuncionDto,
  })
  funcion!: ReporteFuncionDto;

  @ApiProperty({
    description: 'Cantidad de asientos en la reserva',
    example: 2,
  })
  numAsientos!: number;

  @ApiProperty({
    description: 'Monto total de la reserva (monto_final del pago exitoso más reciente; 0 si no hay pago exitoso)',
    example: 350.00,
  })
  montoTotal!: number;

  @ApiProperty({
    description: 'Monto efectivamente reembolsado (suma de reembolsos PROCESADO del pago exitoso; 0 si ninguno)',
    example: 175.00,
  })
  montoReembolsado!: number;

  @ApiProperty({
    description: 'Fecha de creación de la reserva',
    type: String,
    format: 'date-time',
    example: '2026-06-25T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización de la reserva',
    type: String,
    format: 'date-time',
    example: '2026-06-25T10:05:00.000Z',
  })
  updatedAt!: Date;
}
