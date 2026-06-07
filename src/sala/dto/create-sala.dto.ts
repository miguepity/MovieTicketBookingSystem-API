import { IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSalaDto {
  @ApiProperty({ description: 'Nombre de la sala', example: 'Sala 1' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  nombre: string;

  @ApiProperty({ description: 'ID del cine al que pertenece la sala', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  id_cine: number;

  @ApiProperty({ description: 'Número de filas en la sala', example: 10 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  filas: number;

  @ApiProperty({ description: 'Número de columnas por fila', example: 15 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  columnas: number;
}