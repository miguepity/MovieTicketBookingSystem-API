import { Module } from '@nestjs/common';
import { ReservasController } from './reservas.controller';
import { MisReservasController } from './mis-reservas.controller';
import { AdminReservasController } from './admin-reservas.controller';
import { ReservasService } from './reservas.service';
import { AsientosModule } from '../asientos/asientos.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';

@Module({
  imports: [AsientosModule, ReembolsosModule],
  controllers: [ReservasController, MisReservasController, AdminReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}
