import { Module } from '@nestjs/common';
import { PeliculasController } from './peliculas.controller';
import { PeliculasService } from './peliculas.service';

@Module({
  controllers: [PeliculasController],
  providers: [PeliculasService],
})
export class PeliculasModule {}
