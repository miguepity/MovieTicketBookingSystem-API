import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BodyDto {
  @ApiProperty({ example: 'Sala 1' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la sala es requerido.' })
  nombre!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty({ message: 'El id_cine es requerido.' })
  id_cine!: number;

  @ApiProperty({ example: 8, minimum: 1 })
  @IsNumber()
  @IsNotEmpty({ message: 'La cantidad de filas es requerida.' })
  @Min(1)
  filas!: number;

  @ApiProperty({ example: 10, minimum: 1 })
  @IsNumber()
  @IsNotEmpty({ message: 'La cantidad de columnas es requerida.' })
  @Min(1)
  columnas!: number;
}
