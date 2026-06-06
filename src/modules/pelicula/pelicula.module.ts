import { Module } from '@nestjs/common';
import { PeliculaService } from './pelicula.service';
import { PeliculaController } from './pelicula.controller';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

@Module({
  controllers: [PeliculaController],
  providers: [PeliculaService, CloudinaryProvider, CloudinaryService],
})
export class PeliculaModule {}
