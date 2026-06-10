import {
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFuncionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id_pelicula: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id_sala: number;

  @ApiProperty({ example: '2026-07-01T20:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  fecha_hora: string;

  @ApiProperty({ example: 'activa', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  estado: string;
}
