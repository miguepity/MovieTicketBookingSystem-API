import { IsInt, IsDecimal, IsOptional } from 'class-validator';

export class UpdatePoliticaCancelacionDto {
  @IsOptional()
  @IsInt()
  horas_antes_minimo?: number;

  @IsOptional()
  @IsInt()
  horas_antes_maximo?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  porcentaje_reembolso?: string;
}
