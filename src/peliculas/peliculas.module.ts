import { Module } from '@nestjs/common';
import { PeliculasController } from './peliculas.controller.js';
import { PeliculasService } from './peliculas.service.js';

@Module({
  controllers: [PeliculasController],
  providers: [PeliculasService],
})
export class PeliculasModule {}
