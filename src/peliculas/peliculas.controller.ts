import { Controller, Post } from '@nestjs/common';
import { PeliculasService } from './peliculas.service';

@Controller()
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Post()
  createPelicula() {}
}
