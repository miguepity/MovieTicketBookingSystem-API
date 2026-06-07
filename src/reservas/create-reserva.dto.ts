import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateReservaDto {
  @ApiProperty({ example: 1, description: 'ID de la función seleccionada' })
  @IsInt()
  @IsNotEmpty()
  id_funcion!: number;

  @ApiProperty({ example: [105, 106], description: 'Arreglo de IDs de la tabla AsientosFuncion' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  asientosFuncionIds!: number[];
}