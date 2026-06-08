import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class ListPreciosCineQueryDto {
  @ApiPropertyOptional({ type: String, example: '1' })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  id_cine?: string;

  @ApiPropertyOptional({ type: String, example: '1' })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  id_tipo_asiento?: string;
}
