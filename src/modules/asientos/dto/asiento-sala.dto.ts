import { ApiProperty } from '@nestjs/swagger';

export class AsientoSalaDto {
  @ApiProperty({ type: Number, description: 'Número de filas de la sala', example: 10 })
  filas!: number;

  @ApiProperty({ type: Number, description: 'Número de columnas de la sala', example: 15 })
  columnas!: number;
}
