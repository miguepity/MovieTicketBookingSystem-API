import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumberString,
  IsOptional,
  Min,
} from 'class-validator';

export class CheckConflictosQueryDto {
  @IsNumberString()
  id_cine: string;

  @IsNumberString()
  id_sala: string;

  @IsDateString()
  fecha_hora: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  duracion_min: number;

  @IsOptional()
  @IsNumberString()
  ignorar_id?: string;
}
