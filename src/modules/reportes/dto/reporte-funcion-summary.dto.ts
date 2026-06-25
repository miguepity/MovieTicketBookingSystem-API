import { ApiProperty } from '@nestjs/swagger';
import { ReporteSalaDto } from './reporte-sala-summary.dto';
import { ReportePeliculaDto } from './reporte-pelicula-summary.dto';

export class ReporteFuncionDto {
  @ApiProperty({
    description: 'ID de la función',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Fecha y hora de la función',
    type: String,
    format: 'date-time',
    example: '2026-06-25T18:30:00.000Z',
  })
  fechaHora!: Date;

  @ApiProperty({
    description: 'Película proyectada en la función',
    type: () => ReportePeliculaDto,
  })
  pelicula!: ReportePeliculaDto;

  @ApiProperty({
    description: 'Sala en que se realiza la función',
    type: () => ReporteSalaDto,
  })
  sala!: ReporteSalaDto;
}
