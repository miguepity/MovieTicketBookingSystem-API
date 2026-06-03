import { IsNotEmpty, IsString, IsInt, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreatePeliculaDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  titulo!: string;

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

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsInt({ message: 'El id_usuario debe ser un número entero válido' })
  @IsNotEmpty({ message: 'El id_usuario es obligatorio' })
  id_usuario!: number;
}
