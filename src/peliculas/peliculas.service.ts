import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

  async uploadPoster(id: number, file: any) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');

    const pelicula = await this.prisma.peliculas.findUnique({ where: { id } });
    if (!pelicula) throw new NotFoundException('Película no encontrada');

    return this.prisma.peliculas.update({
      where: { id },
      data: { poster_url: `/uploads/posters/${file.filename}` },
    });
  }
}
