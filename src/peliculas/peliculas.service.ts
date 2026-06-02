import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';

@Injectable()
export class PeliculasService {
  constructor(private readonly prisma: PrismaService) {}

  async getTitulo(titulo?: string) {
    if (!titulo) {
      return [];
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.peliculas.findMany({
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

  async update(
    id: number,
    updatePeliculaDto: UpdatePeliculaDto,
    idUsuario: number,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const pelicula = await this.prisma.peliculas.findUnique({
      where: { id: BigInt(id) },
    });

    if (!pelicula) {
      throw new NotFoundException(`Película no encontrada`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.peliculas.update({
      where: { id: BigInt(id) },
      data: {
        ...updatePeliculaDto,
        fecha_estreno: updatePeliculaDto.fecha_estreno
          ? new Date(updatePeliculaDto.fecha_estreno)
          : undefined,
        id_usuario: BigInt(idUsuario),
      },
      select: {
        id: true,
        titulo: true,
        sinopsis: true,
        poster_url: true,
        fecha_estreno: true,
        activo: true,
        updated_at: true,
        id_usuario: true,
        idiomas: { select: { nombre: true } },
        generos: { select: { nombre: true } },
      },
    });
  }
}
