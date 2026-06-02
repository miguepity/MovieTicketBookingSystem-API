import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { PeliculasService } from './peliculas.service.js';
import { CreatePeliculaDto } from './dto/create-pelicula.dto.js';

@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Post()
  create(@Body() body: CreatePeliculaDto) {
    if (!body.titulo || body.titulo.trim() === '') {
      throw new BadRequestException('Title is required');
    }
    if (body.id_usuario === undefined || body.id_usuario === null) {
      throw new BadRequestException('User ID is required');
    }
    if (body.titulo.length > 200) {
      throw new BadRequestException('Title cannot exceed 200 characters');
    }
    if (body.poster_url && body.poster_url.length > 500) {
      throw new BadRequestException('Poster URL cannot exceed 500 characters');
    }
    return this.peliculasService.create(body);
  }
}
