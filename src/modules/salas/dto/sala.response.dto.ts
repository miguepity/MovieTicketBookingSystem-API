import { ApiProperty } from '@nestjs/swagger';

export class SalaResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() nombre!: string;
  @ApiProperty() id_cine!: number;
  @ApiProperty() filas!: number;
  @ApiProperty() columnas!: number;
}
