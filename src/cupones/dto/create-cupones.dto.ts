import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateCuponeDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsNumber()
  @IsNotEmpty()
  valor: number;

  @IsDateString()
  @IsNotEmpty()
  fecha_expiracion: string;

  @IsInt()
  @IsOptional()
  usos_maximos?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
