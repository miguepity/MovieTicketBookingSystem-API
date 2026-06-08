import { ApiProperty } from '@nestjs/swagger';
import { ReportesListItemResponseDto } from './reportes-list-item.response.dto';

export class ReportesReservasPageResponseDto {
  @ApiProperty({ type: [ReportesListItemResponseDto] })
  data!: ReportesListItemResponseDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
}
