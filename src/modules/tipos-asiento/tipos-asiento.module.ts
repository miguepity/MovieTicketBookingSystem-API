import { Module } from '@nestjs/common';
import { TiposAsientoService } from './tipos-asiento.service';
import { TiposAsientoController } from './tipos-asiento.controller';

@Module({
  controllers: [TiposAsientoController],
  providers: [TiposAsientoService],
})
export class TiposAsientoModule {}
