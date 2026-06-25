import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReglaPoliticaDto {
  @ApiProperty({
    description: 'Horas mínimas antes de la función para aplicar esta regla',
    type: Number,
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  horas_antes_minimo!: number;

  @ApiPropertyOptional({
    description: 'Horas máximas antes de la función para aplicar esta regla (null = sin tope)',
    type: Number,
    example: 24,
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  horas_antes_maximo?: number | null;

  @ApiProperty({
    description: 'Porcentaje de reembolso aplicable a esta regla',
    type: Number,
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje_reembolso!: number;
}

export class ReglaPoliticaInputDto {
  @ApiProperty({
    description: 'Horas mínimas antes de la función para aplicar esta regla',
    type: Number,
    example: 0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  horas_antes_minimo!: number;

  @ApiProperty({
    description: 'Horas máximas antes de la función para aplicar esta regla',
    type: Number,
    example: 24,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  horas_antes_maximo!: number;

  @ApiProperty({
    description: 'Porcentaje de reembolso aplicable a esta regla',
    type: Number,
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje_reembolso!: number;
}

export class ReplaceReglasDto {
  @ApiProperty({
    description: 'Lista de reglas de cancelación',
    type: () => ReglaPoliticaInputDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReglaPoliticaInputDto)
  reglas!: ReglaPoliticaInputDto[];
}

export class SetActivaDto {
  @ApiProperty({
    description: 'Indica si la política de cancelación está activa',
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  activa!: boolean;
}
