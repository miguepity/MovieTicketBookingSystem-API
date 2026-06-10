import { IsNumber, IsNotEmpty, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PoliticasBodyDto {
  @ApiProperty({
    example: 24,
    description: 'Horas mínimas antes de la función',
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Las horas mínimas son requeridas.' })
  @IsPositive()
  horas_antes_minimo!: number;

  @ApiProperty({
    example: 48,
    description: 'Horas máximas antes de la función',
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Las horas máximas son requeridas.' })
  @IsPositive()
  horas_antes_maximo!: number;

  @ApiProperty({
    example: 50.0,
    description: 'Porcentaje de reembolso (0.00 a 100.00)',
  })
  @IsNumber()
  @IsNotEmpty({ message: 'El porcentaje de reembolso es requerido.' })
  @IsPositive()
  porcentaje_reembolso!: number; // Usamos number para recibir valores como 50 o 50.5
}
