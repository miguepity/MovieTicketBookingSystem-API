import { Controller, Get, Query } from '@nestjs/common';
import { PeliculasService } from './peliculas.service';

@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Get()
  buscar(@Query('titulo') titulo?: string) {
    return this.peliculasService.getTitulo(titulo);
  }
}
