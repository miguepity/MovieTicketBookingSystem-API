import { IsArray, ArrayMinSize, ArrayMaxSize, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LIMITE_ASIENTOS_POR_BLOQUEO } from 'src/common/constants/bloqueo.constants';

export class BloquearAsientosDto {
  @ApiProperty({
    description: 'Array de IDs de asientos-función a bloquear (serializados como strings)',
    type: [String],
    example: ['12', '13'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(LIMITE_ASIENTOS_POR_BLOQUEO)
  @IsString({ each: true })
  ids_asiento_funcion!: string[];
}
