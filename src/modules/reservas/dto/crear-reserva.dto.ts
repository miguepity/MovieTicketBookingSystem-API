import { IsArray, ArrayMinSize, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearReservaDto {
  @ApiProperty({
    description: 'ID de la función (película + sala + horario)',
    type: String,
    example: '1',
  })
  @IsString()
  id_funcion!: string;

  @ApiProperty({
    description: 'Array de IDs de asientos-función a reservar (mínimo 1)',
    type: [String],
    example: ['12', '13'],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids_asiento_funcion!: string[];
}
