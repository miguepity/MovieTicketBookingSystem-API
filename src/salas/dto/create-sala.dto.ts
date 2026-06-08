import { IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalaDto {
  @IsString()
  @ApiPropertyOptional({ description: 'Nombre de la sala' })
  nombre: string;

  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Numero de filas' })
  filas: number;

  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Número de columnas' })
  columnas: number;
}
