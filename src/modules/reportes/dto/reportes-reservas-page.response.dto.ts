import { ApiProperty } from '@nestjs/swagger';
import { ReportesReservasListItemResponseDto } from './reportes-reservas-list-item.response.dto';

export class ReportesReservasPageResponseDto {
  @ApiProperty({
    description: 'Lista de reservas en la página actual',
    type: () => ReportesReservasListItemResponseDto,
    isArray: true,
  })
  data!: ReportesReservasListItemResponseDto[];

  @ApiProperty({
    description: 'Total de reservas que coinciden con los filtros aplicados',
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
}
