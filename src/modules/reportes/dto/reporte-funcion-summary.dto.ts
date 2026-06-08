import { ApiProperty } from '@nestjs/swagger';
import { ReporteSalaDto } from './reporte-sala-summary.dto';
import { ReportePeliculaDto } from './reporte-pelicula-summary.dto';

export class ReporteFuncionDto {
  @ApiProperty() id!: string;
  @ApiProperty() fechaHora!: Date;
  @ApiProperty({ type: ReportePeliculaDto }) pelicula!: ReportePeliculaDto;
  @ApiProperty({ type: ReporteSalaDto }) sala!: ReporteSalaDto;
}
