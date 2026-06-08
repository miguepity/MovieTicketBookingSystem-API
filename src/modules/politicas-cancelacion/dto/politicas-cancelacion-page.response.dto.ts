import { ApiProperty } from '@nestjs/swagger';
import { PoliticasCancelacionListItemResponseDto } from './politicas-cancelacion-list-item.response.dto';

export class PoliticasCancelacionPageResponseDto {
  @ApiProperty({ type: [PoliticasCancelacionListItemResponseDto] })
  data!: PoliticasCancelacionListItemResponseDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
}
