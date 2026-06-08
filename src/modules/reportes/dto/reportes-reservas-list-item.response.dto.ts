import { ApiProperty } from '@nestjs/swagger';
import { ReporteFuncionDto } from './reporte-funcion-summary.dto';
import { ReporteUsuarioDto } from './reporte-usuario-summary.dto';

export class ReportesReservasListItemResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() numeroReserva!: string;
  @ApiProperty() estado!: string;
  @ApiProperty({ type: ReporteUsuarioDto }) usuario!: ReporteUsuarioDto;
  @ApiProperty({ type: ReporteFuncionDto }) funcion!: ReporteFuncionDto;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
