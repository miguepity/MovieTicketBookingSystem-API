import { Injectable } from '@nestjs/common';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PeliculasService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPeliculaDto: CreatePeliculaDto) {
    return this.prisma.peliculas.create({
      data: { ...createPeliculaDto },
    });
  }

  findAll() {
    return this.prisma.peliculas.findMany();
  }

  findOne(id: number) {
    return this.prisma.peliculas.findUnique({
      where: { id },
    });
  }

  update(id: number, updatePeliculaDto: UpdatePeliculaDto) {
    return this.prisma.peliculas.update({
      where: { id },
      data: { ...updatePeliculaDto },
    });
  }

  remove(id: number) {
    return this.prisma.peliculas.delete({
      where: { id },
    });
  }

  cambiarEstado(id: number, activo: boolean) {
    return this.prisma.peliculas.update({
      where: { id },
      data: { activo },
    });
  }

  buscar(titulo?: string, id_genero?: number, id_idioma?: number) {
    return this.prisma.peliculas.findMany({
      where: {
        ...(titulo && { titulo: { contains: titulo, mode: 'insensitive' } }),
        ...(id_genero && { id_genero }),
        ...(id_idioma && { id_idioma }),
      },
      include: {
        generos: true,
        idiomas: true,
      },
    });
  }

  buscarPorCine(id_cine: number) {
    return this.prisma.peliculas.findMany({
      where: {
        funciones: {
          some: {
            salas: {
              id_cine,
            },
          },
        },
      },
      include: {
        generos: true,
        idiomas: true,
      },
    });
  }
}
