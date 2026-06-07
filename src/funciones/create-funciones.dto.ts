import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsDateString, IsString, IsOptional } from 'class-validator';

export class CreateFuncionDto {
  @ApiProperty({ example: 1, description: 'ID de la película' })
  @IsInt()
  @IsNotEmpty()
  id_pelicula!: number;

  @ApiProperty({ example: 1, description: 'ID de la sala' })
  @IsInt()
  @IsNotEmpty()
  id_sala!: number;

  @ApiProperty({ example: '2026-06-15T18:30:00.000Z', description: 'Fecha y hora en formato ISO' })
  @IsDateString()
  @IsNotEmpty()
  fecha_hora!: string;

  @ApiProperty({ example: 'DISPONIBLE', default: 'DISPONIBLE', required: false })
  @IsOptional()
  @IsString()
  estado?: string;
}