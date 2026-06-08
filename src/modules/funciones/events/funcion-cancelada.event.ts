export class FuncionCanceladaEvent {
  static readonly NAME = 'funcion.cancelada';

  constructor(public readonly idFuncion: string) {}
}
