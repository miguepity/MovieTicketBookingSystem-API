import { Module } from '@nestjs/common';
import { SalasController } from './salas.controller';
import { SalaService } from './salas.service';

@Module({
  controllers: [SalasController],
  providers: [SalaService],
})
export class SalaModule {}
