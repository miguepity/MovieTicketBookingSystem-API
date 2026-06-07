import { IsNumber, IsNotEmpty, IsDateString, IsString, MaxLength } from 'class-validator';

export class CreateFuncionDto {
  @IsNumber()
  @IsNotEmpty()
  id_pelicula: number;

  @IsNumber()
  @IsNotEmpty()
  id_sala: number;

  @IsDateString()
  @IsNotEmpty()
  fecha_hora: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  estado: string;
}
