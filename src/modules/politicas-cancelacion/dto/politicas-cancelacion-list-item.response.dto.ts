import { ApiProperty } from '@nestjs/swagger';

export class ReglaPoliticaResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  horas_antes_minimo!: number;
  @ApiProperty({ nullable: true })
  horas_antes_maximo!: number | null;
  @ApiProperty()
  porcentaje_reembolso!: number;
}

export class PoliticasCancelacionListItemResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  id_cine!: string;
  @ApiProperty()
  nombre!: string;
  @ApiProperty()
  activa!: boolean;
  @ApiProperty({ type: [ReglaPoliticaResponseDto] })
  reglas!: ReglaPoliticaResponseDto[];
}
