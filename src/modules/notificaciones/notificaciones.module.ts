import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { SuscripcionesEstrenoModule } from 'src/modules/suscripciones-estreno/suscripciones-estreno.module';

@Module({
  imports: [SuscripcionesEstrenoModule],
  providers: [NotificacionesService],
})
export class NotificacionesModule {}
