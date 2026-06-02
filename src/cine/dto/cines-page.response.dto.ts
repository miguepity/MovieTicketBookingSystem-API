import { ApiProperty } from '@nestjs/swagger';
import { CineListItemResponseDto } from './cine-list-item.response.dto';

export class CinesPageResponseDto {
  @ApiProperty({ type: [CineListItemResponseDto] })
  data!: CineListItemResponseDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
}
