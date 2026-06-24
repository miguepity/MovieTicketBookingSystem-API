import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import {
  MetodosPagoController,
  MetodosPagoDeprecatedController,
} from './metodos-pago.controller';
import { MetodosPagoService } from './metodos-pago.service';

@Module({
  imports: [PrismaModule],
  controllers: [MetodosPagoController, MetodosPagoDeprecatedController],
  providers: [MetodosPagoService],
})
export class MetodosPagoModule {}
