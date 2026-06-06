export class PagoExitosoEvent {
  static readonly NAME = 'pago.exitoso';

  constructor(
    public readonly idPago: string,
    public readonly idReserva: string,
    public readonly idUsuario: string,
  ) {}
}
