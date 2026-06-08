import { ApiProperty } from '@nestjs/swagger';
import { ReportesReservasListItemResponseDto } from './reportes-reservas-list-item.response.dto';

export class ReportesReservasPageResponseDto {
  @ApiProperty({ type: [ReportesReservasListItemResponseDto] })
  data!: ReportesReservasListItemResponseDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
}
