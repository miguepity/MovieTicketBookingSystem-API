import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';

@Injectable()
export class PeliculaService {
  constructor(private readonly prisma: PrismaService) {}

  async createPelicula(data: CreatePeliculaDto): Promise<{ id: bigint }> {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: data.id_usuario },
      select: { id: true },
    });
    if (!usuario) {
      throw new BadRequestException('Usuario no existe');
    }

    if (data.id_idioma !== undefined && data.id_idioma !== null) {
      const idioma = await this.prisma.idiomas.findUnique({
        where: { id: data.id_idioma },
        select: { id: true },
      });
      if (!idioma) {
        throw new BadRequestException('Idioma no existe');
      }
    }

    if (data.id_genero !== undefined && data.id_genero !== null) {
      const genero = await this.prisma.generos.findUnique({
        where: { id: data.id_genero },
        select: { id: true },
      });
      if (!genero) {
        throw new BadRequestException('Género no existe');
      }
    }

    const pelicula = await this.prisma.peliculas.create({
      data: {
        titulo: data.titulo,
        sinopsis: data.sinopsis,
        poster_url: data.poster_url,
        id_idioma: data.id_idioma,
        id_genero: data.id_genero,
        fecha_estreno: data.fecha_estreno
          ? new Date(data.fecha_estreno)
          : undefined,
        activo: data.activo,
        id_usuario: data.id_usuario,
      },
      select: { id: true },
    });

    return { id: pelicula.id };
  }
}
