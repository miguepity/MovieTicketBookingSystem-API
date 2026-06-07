export class AsientoDto {
  codigo!: string;
  tipo!: string;
}

export class ConfirmacionEmailDto {
  nombre!: string;
  email!: string;
  numeroReserva!: string;
  pelicula!: string;
  cine!: string;
  fechaFuncion!: string;
  asientos!: AsientoDto[];
  montoOriginal!: string;
  montoDescuento!: string;
  montoFinal!: string;
  metodo!: string;
}
