import { Injectable } from '@nestjs/common';
import { CreatePeliculaDto } from './dto/create-pelicula.dto.js';

@Injectable()
export class PeliculasService {
  //aun no hay inject de prisma.pelicula
  //aun no hay controller de peliculas

  async create(dto: CreatePeliculaDto) {
    //aun no existe el prisma.pelicula
    return {
      message: 'Movie created successfully',
      data: dto,
    };
  }
}
