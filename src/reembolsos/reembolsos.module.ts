import { Module } from '@nestjs/common';
import { ReembolsosService } from './reembolsos.services';
import { ReembolsosController } from './reembolsos.controller';
@Module({
  controllers: [ReembolsosController],
  providers: [ReembolsosService],
  exports: [ReembolsosService],
})
export class ReembolsosModule {}
