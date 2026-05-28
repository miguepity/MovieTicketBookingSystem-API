import { Body, Controller, Post } from '@nestjs/common';
import { PeliculasService } from './peliculas.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';

@Controller()
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Post()
  createPelicula(@Body() dto: CreatePeliculaDto) {
    return this.peliculasService.createPelicula(dto);
  }
}
