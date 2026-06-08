import { IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePoliticaCancelacionDto {
  @ApiProperty({
    description: 'Horas mínimas antes de la función para aplicar esta política',
    example: 24,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  horas_antes_minimo: number;

  @ApiProperty({
    description: 'Horas máximas antes de la función (null = sin límite superior)',
    example: 48,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  horas_antes_maximo?: number;

  @ApiProperty({
    description: 'Porcentaje de reembolso (0.00 - 100.00)',
    example: 80.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje_reembolso: number;
}
