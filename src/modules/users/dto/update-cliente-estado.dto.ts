import { IsIn } from 'class-validator';

export class UpdateClienteEstadoDto {
  @IsIn(['activo', 'bloqueado'])
  estado: 'activo' | 'bloqueado';
}
