import { IsBoolean } from 'class-validator';

export class ToggleNotificacionesDto {
  @IsBoolean()
  notificaciones_activas: boolean;
}
