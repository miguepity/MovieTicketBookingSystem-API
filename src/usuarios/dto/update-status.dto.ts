import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsNotEmpty({ message: 'El estado/status es requerido.' })
  @IsIn(['activo', 'inactivo', 'bloqueado'], {
    message:
      'El status debe ser uno de los siguientes valores: activo, inactivo o bloqueado.',
  })
  status: string;
}
