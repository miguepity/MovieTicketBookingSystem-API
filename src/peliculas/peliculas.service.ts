import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PeliculasService {
  constructor(private readonly prisma: PrismaService) {}

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
}
