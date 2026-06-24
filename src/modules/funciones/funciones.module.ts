import { Module } from '@nestjs/common';
import { FuncionesService } from './funciones.service';
import { FuncionesController } from './funciones.controller';
import { AdminFuncionesController } from './admin-funciones.controller';

@Module({
  controllers: [FuncionesController, AdminFuncionesController],
  providers: [FuncionesService],
})
export class FuncionesModule {}
