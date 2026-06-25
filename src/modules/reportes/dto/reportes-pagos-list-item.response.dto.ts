import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReporteCuponDto } from './reporte-cupon-summary.dto';
import { ReporteReembolsoDto } from './reporte-reembolso-summary.dto';
import { ReporteReservasDto } from './reporte-reserva-summary.dto';

export class ReportesPagosListItemResponseDto {
  @ApiProperty({
    description: 'ID del pago',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Monto original del pago antes de aplicar descuentos',
    type: Number,
    example: 12345.67,
  })
  montoOriginal!: number;

  @ApiProperty({
    description: 'Monto final pagado tras aplicar cupones y descuentos',
    type: Number,
    example: 10500.5,
  })
  montoFinal!: number;

  @ApiProperty({
    description: 'Método de pago utilizado',
    example: 'TARJETA_CREDITO',
  })
  metodo!: string;

  @ApiProperty({
    description: 'Estado actual del pago',
    example: 'COMPLETADO',
  })
  estado!: string;

  @ApiProperty({
    description: 'Referencia externa del procesador de pago',
    type: String,
    nullable: true,
    example: 'TXN-98765432',
  })
  referenciaExterna!: string | null;

  @ApiProperty({
    description: 'Reserva asociada al pago',
    type: () => ReporteReservasDto,
  })
  reserva!: ReporteReservasDto;

  @ApiPropertyOptional({
    description: 'Cupón aplicado al pago (si existe)',
    type: () => ReporteCuponDto,
  })
  cupon?: ReporteCuponDto;

  @ApiProperty({
    description: 'Lista de reembolsos asociados a este pago',
    type: () => ReporteReembolsoDto,
    isArray: true,
  })
  reembolsos!: ReporteReembolsoDto[];

  @ApiProperty({
    description: 'Fecha de creación del pago',
    type: String,
    format: 'date-time',
    example: '2026-06-25T18:30:00.000Z',
  })
  createdAt!: Date;
}
