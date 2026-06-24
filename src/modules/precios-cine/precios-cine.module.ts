import { Module } from '@nestjs/common';
import { PreciosCineService } from './precios-cine.service';
import { PreciosCineController } from './precios-cine.controller';
import { PreciosMatrizController } from './precios-matriz.controller';

@Module({
  controllers: [PreciosCineController, PreciosMatrizController],
  providers: [PreciosCineService],
})
export class PreciosCineModule {}
