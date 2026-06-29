import { Module } from '@nestjs/common';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';

@Module({
  imports: [ReembolsosModule],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}
