import { ApiProperty } from '@nestjs/swagger';
import { ReporteCineDto } from './reporte-cine-summary.dto';

export class ReporteSalaDto {
  @ApiProperty() id!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty({ type: ReporteCineDto }) cine!: ReporteCineDto;
}
