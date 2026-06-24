import { Module } from '@nestjs/common';
import { ReembolsosController } from './reembolsos.controller';
import { MisReembolsosController } from './mis-reembolsos.controller';
import { ReembolsosService } from './reembolsos.service';

@Module({
  controllers: [ReembolsosController, MisReembolsosController],
  providers: [ReembolsosService],
  exports: [ReembolsosService],
})
export class ReembolsosModule {}
