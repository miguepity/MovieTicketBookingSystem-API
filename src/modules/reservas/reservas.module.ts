import { Module } from '@nestjs/common';
import { ReservasController } from './reservas.controller';
import { MisReservasController } from './mis-reservas.controller';
import { AdminReservasController } from './admin-reservas.controller';
import { ReservasService } from './reservas.service';
import { ReservasExpiracionService } from './reservas-expiracion.service';
import { AsientosModule } from '../asientos/asientos.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { MailModule } from '../mail/mail.module';
import { BoletosModule } from '../boletos/boletos.module';

@Module({
  imports: [AsientosModule, ReembolsosModule, MailModule, BoletosModule],
  controllers: [ReservasController, MisReservasController, AdminReservasController],
  providers: [ReservasService, ReservasExpiracionService],
  exports: [ReservasService],
})
export class ReservasModule {}
