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
  @ApiProperty({ example: 'Sala 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  @IsPositive()
  filas!: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  @IsPositive()
  columnas!: number;

  @ApiProperty({ type: String, example: '1' })
  @IsString()
  @IsNotEmpty()
  id_cine!: string;
}
