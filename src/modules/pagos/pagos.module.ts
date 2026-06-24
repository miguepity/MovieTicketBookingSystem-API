import { Module } from '@nestjs/common';
import { PagosController } from './pagos.controller';
import { AdminPagosController } from './admin-pagos.controller';
import { PagosService } from './pagos.service';
import { ReservasModule } from '../reservas/reservas.module';

@Module({
  imports: [ReservasModule],
  controllers: [PagosController, AdminPagosController],
  providers: [PagosService],
})
export class PagosModule {}
