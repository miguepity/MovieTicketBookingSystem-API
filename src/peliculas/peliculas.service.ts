import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';

@Injectable()
export class PeliculasService {
  constructor(private prisma: PrismaService) {}

  async createPelicula(dto: CreatePeliculaDto) {
    return await this.prisma.peliculas.create({
      data: {
        titulo: dto.titulo,
        sinopsis: dto.sinopsis,
        poster_url: dto.poster_url,
        id_idioma: dto.idioma ? BigInt(dto.idioma) : null,
        id_genero: dto.genero ? BigInt(dto.genero) : null,
        fecha_estreno: dto.fecha_estreno,
        id_usuario: BigInt(dto.uploaded_by),
      },
    });
  }
}
