import { IsString, IsDateString } from 'class-validator';

export class CreateFuncionDto {
  @IsString()
  id_pelicula!: string;

  @IsString()
  id_sala!: string;

  @IsDateString()
  fecha_hora!: string;

  @IsString()
  estado!: string;
}
