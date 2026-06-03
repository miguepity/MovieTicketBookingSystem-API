import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsUrl,
} from 'class-validator';

export class UpdatePeliculaDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  sinopsis?: string;

  @IsOptional()
  @IsUrl({}, { message: 'El poster_url debe ser una URL válida' })
  poster_url?: string;

  @IsOptional()
  @IsInt()
  id_idioma?: number;

  @IsOptional()
  @IsInt()
  id_genero?: number;

  @IsOptional()
  @IsString()
  fecha_estreno?: string;

  @IsInt({ message: 'El id_editor debe ser un número entero válido' })
  @IsNotEmpty({ message: 'El id_editor es obligatorio' })
  id_editor!: number;
}
