import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, ArrayNotEmpty, Min } from 'class-validator';

export class BloquearAsientoDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'IDs de AsientosFuncion a bloquear',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids_asientos_funcion!: number[];

  @ApiProperty({
    example: 10,
    description: 'Minutos que dura el bloqueo temporal',
  })
  @IsInt()
  @Min(1)
  minutos!: number;

  @ApiProperty({
    example: 1,
    description: 'ID del usuario que bloquea los asientos',
  })
  @IsInt()
  @Min(1)
  id_usuario!: number;
}
