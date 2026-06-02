import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UploadPosterDto } from './dto/upload-poster.dto';

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

  async getTitulo(titulo?: string) {
    if (!titulo) {
      return [];
    }
    return this.prisma.peliculas.findMany({
      where: {
        activo: true,
        titulo: {
          contains: titulo,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        titulo: true,
        sinopsis: true,
        poster_url: true,
        fecha_estreno: true,
        idiomas: { select: { nombre: true } },
        generos: { select: { nombre: true } },
      },
    });
  }

  async uploadPoster(id: bigint, dto: UploadPosterDto) {
    return this.prisma.peliculas.update({
      where: {
        id,
      },
      data: {
        poster_url: dto.posterUrl,
      },
    });
  }
}
