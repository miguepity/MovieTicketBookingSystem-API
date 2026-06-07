export class AsientoDto {
  codigo!: string;
  tipo!: string;
}

export class CancelacionEmailDto {
  nombre!: string;
  email!: string;
  numeroReserva!: string;
  pelicula!: string;
  cine!: string;
  fechaFuncion!: string;
  asientos!: AsientoDto[];
  montoPagado?: string;
  estadoReembolso!: string;
  montoReembolso?: string;
}
