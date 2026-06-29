import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsArray, ArrayNotEmpty, IsOptional } from 'class-validator';

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

  @ApiProperty({ example: 2, description: 'ID del cliente (opcional, solo para recepcionistas)', required: false })
  @IsInt()
  @IsOptional()
  id_usuario_cliente?: number;
}
