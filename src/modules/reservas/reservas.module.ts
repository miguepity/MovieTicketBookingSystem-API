import { Module } from '@nestjs/common';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { AsientosModule } from '../asientos/asientos.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';

@Module({
  imports: [AsientosModule, ReembolsosModule],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}
