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
  @ApiProperty({ example: 0, description: 'Horas mínimas antes de la función' })
  @IsInt()
  @Min(0)
  horas_antes_minimo!: number;

  @ApiPropertyOptional({
    example: 24,
    nullable: true,
    description: 'Horas máximas antes de la función (null = sin tope)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  horas_antes_maximo?: number | null;

  @ApiProperty({ example: 50, description: 'Porcentaje de reembolso (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje_reembolso!: number;
}

export class ReglaPoliticaInputDto {
  @ApiProperty({ example: 0, description: 'Horas mínimas antes de la función' })
  @IsNumber()
  @Min(0)
  horas_antes_minimo!: number;

  @ApiProperty({ example: 24, description: 'Horas máximas antes de la función' })
  @IsNumber()
  @Min(0)
  horas_antes_maximo!: number;

  @ApiProperty({ example: 50, description: 'Porcentaje de reembolso (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje_reembolso!: number;
}

export class ReplaceReglasDto {
  @ApiProperty({ type: [ReglaPoliticaInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReglaPoliticaInputDto)
  reglas!: ReglaPoliticaInputDto[];
}

export class SetActivaDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  activa!: boolean;
}
