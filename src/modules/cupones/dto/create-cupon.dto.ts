import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateCuponDto {
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @IsString()
  tipo!: string;

  @IsNumber()
  valor!: number;

  @IsDateString()
  fecha_expiracion!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usos_maximos?: number;
}
