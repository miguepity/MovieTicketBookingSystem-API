import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SalaListItemResponseDto } from './sala-list-item.response.dto';

export class CineListItemResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiPropertyOptional() address!: string | null;
  @ApiProperty() id_ciudad!: number;
  @ApiProperty({ type: () => SalaListItemResponseDto, isArray: true })
  @Type(() => SalaListItemResponseDto)
  salas!: SalaListItemResponseDto[];
}
