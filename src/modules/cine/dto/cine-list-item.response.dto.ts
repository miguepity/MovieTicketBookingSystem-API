import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SalaListItemResponseDto } from './sala-list-item.response.dto';

export class CineListItemResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() nombre!: string;
  @ApiPropertyOptional() direccion!: string | null;
  @ApiProperty() id_ciudad!: string;
  @ApiProperty({ type: () => SalaListItemResponseDto, isArray: true })
  @Type(() => SalaListItemResponseDto)
  salas!: SalaListItemResponseDto[];
  @ApiProperty() fecha_creacion!: Date;
}
