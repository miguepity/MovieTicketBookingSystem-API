import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReglaPoliticaResponseDto {
  @ApiProperty({
    description: 'ID de la regla de cancelación',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Horas mínimas antes de la función para aplicar esta regla',
    type: Number,
    example: 0,
    minimum: 0,
  })
  horas_antes_minimo!: number;

  @ApiProperty({
    description: 'Horas máximas antes de la función para aplicar esta regla',
    type: Number,
    example: 24,
    nullable: true,
  })
  horas_antes_maximo!: number | null;

  @ApiProperty({
    description: 'Porcentaje de reembolso aplicable',
    type: Number,
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  porcentaje_reembolso!: number;
}

export class PoliticasCancelacionListItemResponseDto {
  @ApiProperty({
    description: 'ID de la política de cancelación',
    type: String,
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'ID del cine al que aplica esta política',
    type: String,
    example: '1',
  })
  id_cine!: string;

  @ApiProperty({
    description: 'Nombre de la política de cancelación',
    type: String,
    example: 'Política Cine A 2026',
    maxLength: 100,
  })
  nombre!: string;

  @ApiProperty({
    description: 'Indica si la política está activa',
    type: Boolean,
    example: true,
  })
  activa!: boolean;

  @ApiProperty({
    description: 'Reglas que conforman esta política',
    type: () => ReglaPoliticaResponseDto,
    isArray: true,
  })
  @Type(() => ReglaPoliticaResponseDto)
  reglas!: ReglaPoliticaResponseDto[];
}
