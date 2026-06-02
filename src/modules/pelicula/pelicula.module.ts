import { Module } from '@nestjs/common';
import { PeliculaService } from './pelicula.service';
import { PeliculaController } from './pelicula.controller';

@Module({
  controllers: [PeliculaController],
  providers: [PeliculaService],
})
export class PeliculaModule {}
