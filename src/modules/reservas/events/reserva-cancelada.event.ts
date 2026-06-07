export class ReservaCanceladaEvent {
  static readonly NAME = 'reserva.cancelada';

  constructor(
    public readonly idReserva: string,
    public readonly idUsuario: string,
    public readonly idReembolso: string | null,
  ) {}
}
