export type FuncionSnapshot = {
  id_pelicula: string;
  pelicula_titulo: string;
  id_sala: string;
  sala_nombre: string;
  fecha_hora: string;
  estado: string;
};

type FuncionInput = {
  id_pelicula: bigint;
  id_sala: bigint;
  fecha_hora: Date;
  estado: string;
  peliculas: { titulo: string };
  salas: { nombre: string };
};

export function snapshotFuncion(f: FuncionInput): FuncionSnapshot {
  return {
    id_pelicula: f.id_pelicula.toString(),
    pelicula_titulo: f.peliculas.titulo,
    id_sala: f.id_sala.toString(),
    sala_nombre: f.salas.nombre,
    fecha_hora: f.fecha_hora.toISOString(),
    estado: f.estado,
  };
}
