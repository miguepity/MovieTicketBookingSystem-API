/// <reference types="multer" />
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class PeliculaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async uploadPoster(id: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Archivo de imagen requerido');
    }

    const peliculaId = this.parseId(id);
    const existing = await this.prisma.peliculas.findUnique({
      where: { id: peliculaId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Película no encontrada');
    }

    const result = await this.cloudinary.uploadPoster(
      file,
      `pelicula_${peliculaId.toString()}`,
    );

    return this.prisma.peliculas.update({
      where: { id: peliculaId },
      data: { poster_url: result.secure_url },
      select: { id: true, poster_url: true },
    });
  }

  findAll(titulo?: string) {
    const trimmed = titulo?.trim();
    return this.prisma.peliculas.findMany({
      where: trimmed
        ? { titulo: { contains: trimmed, mode: 'insensitive' } }
        : undefined,
      orderBy: { created_at: 'desc' },
    });
  }

  async createPelicula(
    data: CreatePeliculaDto,
    userId: bigint,
  ): Promise<{ id: bigint }> {
    await this.assertUsuarioExists(userId);
    await this.assertIdiomaExists(data.id_idioma);
    await this.assertGeneroExists(data.id_genero);

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
        id_usuario: userId,
      },
      select: { id: true },
    });

    return { id: pelicula.id };
  }

  async updatePelicula(id: string, data: UpdatePeliculaDto) {
    const peliculaId = this.parseId(id);

    const existing = await this.prisma.peliculas.findUnique({
      where: { id: peliculaId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Película no encontrada');
    }

    await this.assertIdiomaExists(data.id_idioma);
    await this.assertGeneroExists(data.id_genero);

    return this.prisma.peliculas.update({
      where: { id: peliculaId },
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
      },
    });
  }

  async toggleActivo(id: string) {
    const peliculaId = this.parseId(id);

    const existing = await this.prisma.peliculas.findUnique({
      where: { id: peliculaId },
      select: { activo: true },
    });
    if (!existing) {
      throw new NotFoundException('Película no encontrada');
    }

    return this.prisma.peliculas.update({
      where: { id: peliculaId },
      data: { activo: !existing.activo },
      select: { id: true, activo: true },
    });
  }

  private parseId(id: string): bigint {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException('ID inválido');
    }
  }

  private async assertUsuarioExists(id: bigint): Promise<void> {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!usuario) {
      throw new BadRequestException('Usuario no existe');
    }
  }

  private async assertIdiomaExists(
    id: bigint | null | undefined,
  ): Promise<void> {
    if (id === undefined || id === null) return;
    const idioma = await this.prisma.idiomas.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!idioma) {
      throw new BadRequestException('Idioma no existe');
    }
  }

  private async assertGeneroExists(
    id: bigint | null | undefined,
  ): Promise<void> {
    if (id === undefined || id === null) return;
    const genero = await this.prisma.generos.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!genero) {
      throw new BadRequestException('Género no existe');
    }
  }
}
