import { Module } from '@nestjs/common';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { ReservasModule } from '../reservas/reservas.module';

@Module({
  imports: [ReservasModule],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
