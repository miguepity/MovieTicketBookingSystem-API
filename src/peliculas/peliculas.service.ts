import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UploadPosterDto } from './dto/upload-poster.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';

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
      return this.prisma.peliculas.findMany({
        where: { activo: true },
      });
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
    });
  }
  2;

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
    });
  }

  async getFuncionesPorCine(peliculaId: number, cineId: number) {
    // 1. Validar que la película exista
    const pelicula = await this.prisma.peliculas.findUnique({
      where: { id: BigInt(peliculaId) },
    });
    if (!pelicula) {
      throw new NotFoundException(
        `Película con ID ${peliculaId} no encontrada`,
      );
    }

    // 2. Validar que el cine exista
    const cine = await this.prisma.cines.findUnique({
      where: { id: BigInt(cineId) },
    });
    if (!cine) {
      throw new NotFoundException(`Cine con ID ${cineId} no encontrado`);
    }

    // 3. Obtener funciones activas con disponibilidad de asientos
    const funciones = await this.prisma.funciones.findMany({
      where: {
        id_pelicula: BigInt(peliculaId),
        salas: {
          id_cine: BigInt(cineId),
        },
        estado: 'active',
      },
      select: {
        id: true,
        fecha_hora: true,
        estado: true,
        salas: {
          select: {
            id: true,
            nombre: true,
            cines: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        _count: {
          select: {
            asientosFuncions: {
              where: {
                estado: 'disponible',
              },
            },
          },
        },
      },
    });

    return JSON.parse(
      JSON.stringify(funciones, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }
}
