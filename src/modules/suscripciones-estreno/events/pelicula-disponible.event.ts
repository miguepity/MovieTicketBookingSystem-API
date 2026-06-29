export class PeliculaDisponibleEvent {
  static readonly NAME = 'pelicula.disponible';
  constructor(public readonly idPelicula: bigint) {}
}
