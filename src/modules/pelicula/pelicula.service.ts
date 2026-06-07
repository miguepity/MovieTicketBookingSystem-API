/// <reference types="multer" />
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/modules/mail/mail.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { QueryPeliculaDto } from './dto/query-pelicula.dto';
import { CloudinaryService } from './cloudinary.service';
import type { Prisma } from '../../../generated/prisma/client';

@Injectable()
export class PeliculaService {
  private readonly logger = new Logger(PeliculaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly mailService: MailService,
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

  findAll(query: QueryPeliculaDto = {}) {
    const { titulo, genero, idioma, fecha_inicio, fecha_fin, ciudad_id } =
      query;

    const where: Prisma.PeliculasWhereInput = {};

    const trimmed = titulo?.trim();
    if (trimmed) {
      where.titulo = { contains: trimmed, mode: 'insensitive' };
    }
    if (genero !== undefined) {
      where.id_genero = genero;
    }
    if (idioma !== undefined) {
      where.id_idioma = idioma;
    }

    if (fecha_inicio || fecha_fin) {
      where.fecha_estreno = {
        ...(fecha_inicio ? { gte: new Date(fecha_inicio) } : {}),
        ...(fecha_fin ? { lte: new Date(fecha_fin) } : {}),
      };
    }

    if (ciudad_id !== undefined) {
      where.funciones = {
        some: { salas: { cines: { id_ciudad: ciudad_id } } },
      };
    }

    return this.prisma.peliculas.findMany({
      where,
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
      select: {
        id: true,
        titulo: true,
        poster_url: true,
        fecha_estreno: true,
        generos: { select: { nombre: true } },
      },
    });

    void this.notificarNuevaPelicula(pelicula);

    return { id: pelicula.id };
  }

  private async notificarNuevaPelicula(pelicula: {
    id: bigint;
    titulo: string;
    poster_url: string | null;
    fecha_estreno: Date | null;
    generos: { nombre: string } | null;
  }): Promise<void> {
    try {
      const usuarios = await this.prisma.usuarios.findMany({
        where: { notificaciones_activas: true, estado: 'activo' },
        select: { nombre: true, email: true },
      });

      if (usuarios.length === 0) return;

      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
      const link = `${frontendUrl}/peliculas/${pelicula.id.toString()}`;
      const fechaEstreno = pelicula.fecha_estreno
        ? new Intl.DateTimeFormat('es', { dateStyle: 'long' }).format(
            pelicula.fecha_estreno,
          )
        : 'Por anunciar';
      const genero = pelicula.generos?.nombre ?? 'Sin clasificar';

      await Promise.allSettled(
        usuarios.map((u) =>
          this.mailService.sendNuevaPeliculaEmail({
            nombre: u.nombre,
            email: u.email,
            titulo: pelicula.titulo,
            genero,
            fechaEstreno,
            posterUrl: pelicula.poster_url ?? undefined,
            link,
          }),
        ),
      );

      this.logger.log(
        `Notificación de nueva película "${pelicula.titulo}" enviada a ${usuarios.length} usuario(s)`,
      );
    } catch (error) {
      this.logger.error(
        `Error enviando notificaciones de nueva película "${pelicula.titulo}"`,
        error,
      );
    }
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
