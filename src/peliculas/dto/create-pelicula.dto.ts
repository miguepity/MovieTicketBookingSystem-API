import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class CreatePeliculaDto {
  @IsString()
  @Length(1, 200)
  titulo: string;

  @IsString()
  sinopsis: string;

  @IsString()
  poster_url: string;

  @IsString()
  @IsOptional()
  idioma?: string;

  @IsString()
  @IsOptional()
  genero?: string;

  @IsDateString()
  @IsOptional()
  fecha_estreno?: string;

  @IsString()
  uploaded_by: string;
}
