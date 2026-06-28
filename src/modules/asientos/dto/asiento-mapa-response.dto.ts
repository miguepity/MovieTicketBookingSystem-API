import { ApiProperty } from '@nestjs/swagger';
import { AsientoSalaDto } from './asiento-sala.dto';
import { AsientoMapaItemDto } from './asiento-mapa-item.dto';

export class AsientoMapaResponseDto {
  @ApiProperty({ type: String, description: 'ID de la función', example: '1' })
  funcion_id!: string;

  @ApiProperty({ type: () => AsientoSalaDto, description: 'Dimensiones de la sala' })
  sala!: AsientoSalaDto;

  @ApiProperty({
    type: () => AsientoMapaItemDto,
    isArray: true,
    description: 'Lista de asientos de la función con su estado',
  })
  asientos!: AsientoMapaItemDto[];
}
