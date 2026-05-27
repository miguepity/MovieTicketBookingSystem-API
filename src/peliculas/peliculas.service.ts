import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PeliculasService {
  constructor(private readonly prisma: PrismaService) {}

  async getTitulo(titulo?: string) {
    return this.prisma.peliculas.findMany({
      where: titulo
        ? { titulo: { contains: titulo, mode: 'insensitive' } }
        : undefined, //para que no importe si es mayuscula o munuscula
      select: {
        id: true,
        titulo: true,
        sinopsis: true,
        poster_url: true,
        fecha_estreno: true,
        activo: true,
        idiomas: { select: { nombre: true } },
        generos: { select: { nombre: true } },
      },
    });
  }
}
