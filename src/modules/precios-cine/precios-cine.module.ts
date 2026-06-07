import { Module } from '@nestjs/common';
import { PreciosCineService } from './precios-cine.service';
import { PreciosCineController } from './precios-cine.controller';

@Module({
  controllers: [PreciosCineController],
  providers: [PreciosCineService],
})
export class PreciosCineModule {}
