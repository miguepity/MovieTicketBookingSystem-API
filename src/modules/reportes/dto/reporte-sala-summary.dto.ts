import { ApiProperty } from '@nestjs/swagger';
import { ReporteCineDto } from './reporte-cine-summary.dto';

export class ReporteSalaDto {
  @ApiProperty({
    description: 'ID de la sala',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Nombre de la sala',
    example: 'Sala 1 - IMAX',
  })
  nombre!: string;

  @ApiProperty({
    description: 'Cine al que pertenece la sala',
    type: () => ReporteCineDto,
  })
  cine!: ReporteCineDto;
}
