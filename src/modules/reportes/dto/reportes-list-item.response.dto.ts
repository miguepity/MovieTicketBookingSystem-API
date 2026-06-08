import { ApiProperty } from '@nestjs/swagger';
import { ReporteFuncionDto } from './reporte-funcion-summary.dto';
import { ReporteUsuarioDto } from './reporte-usuario-summary.dto';

export class ReportesListItemResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() numero_reserva!: string;
  @ApiProperty() estado!: string;
  @ApiProperty({ type: ReporteUsuarioDto }) usuario!: ReporteUsuarioDto;
  @ApiProperty({ type: ReporteFuncionDto }) funcion!: ReporteFuncionDto;
  @ApiProperty() created_at!: Date;
  @ApiProperty() updated_at!: Date;
}
