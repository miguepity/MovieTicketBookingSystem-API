import { ApiProperty } from '@nestjs/swagger';
import { ReportesPagosListItemResponseDto } from './reportes-pagos-list-item.response.dto';
import { ReportesPagosResumenDto } from './reportes-pagos-resumen.dto';

export class ReportesPagosPageResponseDto {
  @ApiProperty({
    description: 'Lista de pagos en la página actual',
    type: () => ReportesPagosListItemResponseDto,
    isArray: true,
  })
  data!: ReportesPagosListItemResponseDto[];

  @ApiProperty({
    description: 'Total de pagos que coinciden con los filtros aplicados',
    type: Number,
    example: 1234,
  })
  total!: number;

  @ApiProperty({
    description: 'Página actual (comienza en 1)',
    type: Number,
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Cantidad de resultados por página',
    type: Number,
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Resumen agregado de montos para los pagos filtrados',
    type: () => ReportesPagosResumenDto,
  })
  resumen!: ReportesPagosResumenDto;
}
