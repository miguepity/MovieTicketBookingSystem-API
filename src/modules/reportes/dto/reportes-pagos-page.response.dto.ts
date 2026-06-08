import { ApiProperty } from '@nestjs/swagger';
import { ReportesPagosListItemResponseDto } from './reportes-pagos-list-item.response.dto';
import { ReportesPagosResumenDto } from './reportes-pagos-resumen.dto';

export class ReportesPagosPageResponseDto {
  @ApiProperty({ type: [ReportesPagosListItemResponseDto] })
  data!: ReportesPagosListItemResponseDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty({ type: ReportesPagosResumenDto }) resumen!: ReportesPagosResumenDto;
}
