import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreatePoliticasCancelacionDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  horas_antes_minimo!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  horas_antes_maximo?: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  porcentaje_reembolso!: number;
}
