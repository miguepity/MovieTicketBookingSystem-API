import { Module } from '@nestjs/common';
import { AsientosController } from './asientos.controller';
import { AsientosService } from './asientos.service';
import { AsientosCleanupService } from './asientos-cleanup.service';

@Module({
  controllers: [AsientosController],
  providers: [AsientosService, AsientosCleanupService],
  exports: [AsientosService],
})
export class AsientosModule {}
