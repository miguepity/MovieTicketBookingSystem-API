import { ApiProperty } from '@nestjs/swagger';

export class TipoAsientoNestedDto {
  @ApiProperty({ example: '1' })
  id!: string;

  @ApiProperty({ example: 'Estandar' })
  nombre!: string;

  @ApiProperty({ example: '#888888', nullable: true })
  color!: string | null;
}

export class SalaAsientoResponseDto {
  @ApiProperty({ example: '42' })
  id!: string;

  @ApiProperty({ example: 'A' })
  fila!: string;

  @ApiProperty({ example: 5 })
  columna!: number;

  @ApiProperty({ example: 'A5' })
  codigo!: string;

  @ApiProperty({ example: '1' })
  id_tipo_asiento!: string;

  @ApiProperty({ type: TipoAsientoNestedDto })
  tipo!: TipoAsientoNestedDto;
}
