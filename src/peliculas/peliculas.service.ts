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
}
