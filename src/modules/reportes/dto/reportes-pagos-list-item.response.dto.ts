import { ApiProperty } from '@nestjs/swagger';
import { ReporteCuponDto } from './reporte-cupon-summary.dto';
import { ReporteReembolsoDto } from './reporte-reembolso-summary.dto';
import { ReporteReservasDto } from './reporte-reserva-summary.dto';

export class ReportesPagosListItemResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() montoOriginal!: number;
  @ApiProperty() montoFinal!: number;
  @ApiProperty() metodo!: string;
  @ApiProperty() estado!: string;
  @ApiProperty({ nullable: true, type: String }) referenciaExterna!: string | null;
  @ApiProperty({ type: ReporteReservasDto }) reserva!: ReporteReservasDto;
  @ApiProperty({ type: ReporteCuponDto, required: false }) cupon?: ReporteCuponDto;
  @ApiProperty({ type: [ReporteReembolsoDto] }) reembolsos!: ReporteReembolsoDto[];
  @ApiProperty() createdAt!: Date;
}
