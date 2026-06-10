import { Module } from '@nestjs/common';
import { GeneroController } from './genero.controller';
import { GeneroService } from './genero.service';

@Module({
  controllers: [GeneroController],
  providers: [GeneroService]
})
export class GeneroModule {}
