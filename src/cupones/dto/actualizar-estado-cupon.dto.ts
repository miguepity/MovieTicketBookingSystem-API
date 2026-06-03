import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ActualizarEstadoCuponDto {
  @IsBoolean()
  @IsNotEmpty()
  activo: boolean;
}
