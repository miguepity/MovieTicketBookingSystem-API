export class ReservaExpiradaEmailDto {
  to!: { email: string; name?: string };
  numeroReserva!: string;
  tituloPelicula!: string;
  nombreSala!: string;
}
