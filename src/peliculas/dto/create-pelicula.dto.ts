export class CreatePeliculaDto {
  titulo: string;
  sinopsis?: string;
  poster_url?: string;
  id_idioma?: number;
  id_genero?: number;
  fecha_estreno?: string;
  activo?: boolean;
  id_usuario: number;
}
