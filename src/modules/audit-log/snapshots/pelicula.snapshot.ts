export type PeliculaSnapshot = {
  titulo: string;
  sinopsis: string | null;
  fecha_estreno: string | null;
  id_idioma: string | null;
  id_genero: string | null;
  genero_nombre: string | null;
  idioma_nombre: string | null;
  activo: boolean;
};

type PeliculaInput = {
  titulo: string;
  sinopsis: string | null;
  fecha_estreno: Date | null;
  id_idioma: bigint | null;
  id_genero: bigint | null;
  activo: boolean;
  generos?: { nombre: string } | null;
  idiomas?: { nombre: string } | null;
};

export function snapshotPelicula(p: PeliculaInput): PeliculaSnapshot {
  return {
    titulo: p.titulo,
    sinopsis: p.sinopsis ?? null,
    fecha_estreno: p.fecha_estreno
      ? p.fecha_estreno.toISOString().slice(0, 10)
      : null,
    id_idioma: p.id_idioma != null ? p.id_idioma.toString() : null,
    id_genero: p.id_genero != null ? p.id_genero.toString() : null,
    genero_nombre: p.generos?.nombre ?? null,
    idioma_nombre: p.idiomas?.nombre ?? null,
    activo: p.activo,
  };
}
