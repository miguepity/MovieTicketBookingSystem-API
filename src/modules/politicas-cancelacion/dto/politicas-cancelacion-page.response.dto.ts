import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PoliticasCancelacionListItemResponseDto } from './politicas-cancelacion-list-item.response.dto';

export class PoliticasCancelacionPageResponseDto {
  @ApiProperty({
    description: 'Array de políticas de cancelación',
    type: () => PoliticasCancelacionListItemResponseDto,
    isArray: true,
  })
  @Type(() => PoliticasCancelacionListItemResponseDto)
  data!: PoliticasCancelacionListItemResponseDto[];

  @ApiProperty({
    description: 'Total de registros disponibles',
    type: Number,
    example: 50,
    minimum: 0,
  })
  total!: number;

  @ApiProperty({
    description: 'Número de página actual',
    type: Number,
    example: 1,
    minimum: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Cantidad de registros por página',
    type: Number,
    example: 20,
    minimum: 1,
  })
  limit!: number;
}
