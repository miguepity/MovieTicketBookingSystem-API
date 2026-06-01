// dto/create-pelicula.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNumber,
  MaxLength,
} from 'class-validator';

export class CreatePeliculaDto {
  @IsString()
  @MaxLength(200)
  titulo!: string;

  @IsOptional()
  @IsString()
  sinopsis?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  poster_url?: string;

  @IsOptional()
  @IsNumber()
  id_idioma?: bigint;

  @IsOptional()
  @IsNumber()
  id_genero?: bigint;

  @IsOptional()
  @IsDateString()
  fecha_estreno?: Date;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsNumber()
  id_usuario!: bigint;
}
