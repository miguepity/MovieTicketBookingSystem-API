import { IsInt, IsDecimal, IsOptional } from 'class-validator';

export class CreatePoliticaCancelacionDto {
  @IsInt()
  horas_antes_minimo: number;

  @IsOptional()
  @IsInt()
  horas_antes_maximo?: number;

  @IsDecimal({ decimal_digits: '1,2' })
  porcentaje_reembolso: string;
}
