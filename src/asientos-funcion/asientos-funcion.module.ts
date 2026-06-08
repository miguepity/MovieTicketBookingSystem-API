import { Module } from '@nestjs/common';
import { AsientosFuncionService } from './asientos-funcion.service';
import { AsientosFuncionController } from './asientos-funcion.controller';
import { AsientosFuncionScheduler } from './asientos-funcion.scheduler';

@Module({
  controllers: [AsientosFuncionController],
  providers: [AsientosFuncionService, AsientosFuncionScheduler],
})
export class AsientosFuncionModule {}
