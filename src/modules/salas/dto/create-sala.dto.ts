import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSalaDto {
  @ApiProperty({
    description: 'Nombre de la sala',
    example: 'Sala 1',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre!: string;

  @ApiProperty({
    description: 'Número de filas en la sala',
    example: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsPositive()
  filas!: number;

  @ApiProperty({
    description: 'Número de columnas en la sala',
    example: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsPositive()
  columnas!: number;

  @ApiProperty({
    description: 'ID del cine (serializador como string)',
    type: String,
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  id_cine!: string;
}
