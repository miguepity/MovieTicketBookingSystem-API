import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePeliculaDto } from './dto/create-pelicula.dto.js';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto.js';
import { ToggleStatusPeliculaDto } from './dto/toggle-status-pelicula.dto.js';

@Injectable()
export class PeliculasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePeliculaDto) {
    try {
      const pelicula = await this.prisma.peliculas.create({
        data: {
          titulo: dto.titulo,
          sinopsis: dto.sinopsis,
          poster_url: dto.poster_url,
          id_idioma: dto.id_idioma ? BigInt(dto.id_idioma) : null,
          id_genero: dto.id_genero ? BigInt(dto.id_genero) : null,
          fecha_estreno: dto.fecha_estreno ? new Date(dto.fecha_estreno) : null,
          activo: dto.activo ?? true,
          id_usuario: BigInt(dto.id_usuario),
        },
      });

      return {
        message: 'Película creada exitosamente',
        data: this.serializePelicula(pelicula),
      };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new BadRequestException('El id_usuario, id_idioma o id_genero no existe.');
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdatePeliculaDto) {
    await this.findOneOrFail(id);

    const pelicula = await this.prisma.peliculas.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo }),
        ...(dto.sinopsis !== undefined && { sinopsis: dto.sinopsis }),
        ...(dto.poster_url !== undefined && { poster_url: dto.poster_url }),
        ...(dto.id_idioma !== undefined && { id_idioma: BigInt(dto.id_idioma) }),
        ...(dto.id_genero !== undefined && { id_genero: BigInt(dto.id_genero) }),
        ...(dto.fecha_estreno !== undefined && { fecha_estreno: new Date(dto.fecha_estreno) }),
      },
    });

    return {
      message: 'Película actualizada exitosamente',
      data: this.serializePelicula(pelicula),
      editor: {
        id_editor: dto.id_editor,
        fecha_modificacion: pelicula.updated_at,
      },
    };
  }

  async toggleStatus(id: string, dto: ToggleStatusPeliculaDto) {
    const existing = await this.findOneOrFail(id);

    const pelicula = await this.prisma.peliculas.update({
      where: { id: BigInt(id) },
      data: { activo: !existing.activo },
    });

    return {
      message: `Película ${pelicula.activo ? 'activada' : 'desactivada'} exitosamente`,
      data: {
        id: Number(pelicula.id),
        activo: pelicula.activo,
      },
      editor: {
        id_editor: dto.id_editor,
        fecha_modificacion: pelicula.updated_at,
      },
    };
  }

  private async findOneOrFail(id: string) {
    const pelicula = await this.prisma.peliculas.findUnique({
      where: { id: BigInt(id) },
    });

    if (!pelicula) {
      throw new NotFoundException(`Película con id ${id} no encontrada`);
    }

    return pelicula;
  }

  private serializePelicula(pelicula: Record<string, unknown>) {
    return JSON.parse(
      JSON.stringify(pelicula, (_key, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      ),
    );
  }
}
