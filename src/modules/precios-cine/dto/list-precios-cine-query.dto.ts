import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class ListPreciosCineQueryDto {
  @ApiPropertyOptional({
    type: String,
    example: '1',
    description: 'Filtrar por ID del cine (BigInt como string)',
  })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  id_cine?: string;

  @ApiPropertyOptional({
    type: String,
    example: '1',
    description: 'Filtrar por ID del tipo de asiento (BigInt como string)',
  })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  id_tipo_asiento?: string;
}
