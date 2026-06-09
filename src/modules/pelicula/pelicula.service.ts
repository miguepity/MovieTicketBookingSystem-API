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
import { EstadoAsiento } from 'src/common/enums/estado-asiento.enum';
import { EstadoFuncion } from 'src/common/enums/estado-funcion.enum';
import { AuditLogService } from '../audit-log/audit-log.service';
import type { Prisma } from '../../../generated/prisma/client';

@Injectable()
export class PeliculaService {
  private readonly logger = new Logger(PeliculaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly mailService: MailService,
    private readonly auditLog: AuditLogService,
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
        activo: true,
        generos: { select: { nombre: true } },
      },
    });

    await this.auditLog.registrar({
      id_usuario: userId,
      id_auditor: userId,
      accion: 'PELICULA_CREAR',
      detalle: `Película ${pelicula.id.toString()} (${pelicula.titulo}) creada`,
    });

    if (pelicula.activo) {
      void this.notificarNuevaPelicula(pelicula);
    }

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

      const BATCH_SIZE = 25;
      for (let i = 0; i < usuarios.length; i += BATCH_SIZE) {
        const batch = usuarios.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(
          batch.map((u) =>
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
      }

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

  async updatePelicula(id: string, data: UpdatePeliculaDto, auditorId: bigint) {
    const peliculaId = this.parseId(id);

    const existing = await this.prisma.peliculas.findUnique({
      where: { id: peliculaId },
      select: { id: true, id_usuario: true, titulo: true },
    });
    if (!existing) {
      throw new NotFoundException('Película no encontrada');
    }

    await this.assertIdiomaExists(data.id_idioma);
    await this.assertGeneroExists(data.id_genero);

    const updated = await this.prisma.peliculas.update({
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
      select: {
        id: true,
        titulo: true,
        sinopsis: true,
        poster_url: true,
        fecha_estreno: true,
        activo: true,
        id_genero: true,
        id_idioma: true,
        generos: { select: { id: true, nombre: true } },
        idiomas: { select: { id: true, nombre: true } },
      },
    });

    await this.auditLog.registrar({
      id_usuario: existing.id_usuario,
      id_auditor: auditorId,
      accion: 'PELICULA_EDITAR',
      detalle: `Película ${peliculaId.toString()} (${existing.titulo}) editada`,
    });

    return updated;
  }

  async findCinesByPelicula(id: string) {
    const peliculaId = this.parseId(id);

    const pelicula = await this.prisma.peliculas.findUnique({
      where: { id: peliculaId },
      select: { id: true },
    });
    if (!pelicula) {
      throw new NotFoundException('Película no encontrada');
    }

    return this.prisma.cines.findMany({
      where: {
        salas: {
          some: {
            funciones: {
              some: {
                id_pelicula: peliculaId,
                estado: EstadoFuncion.PROGRAMADA,
              },
            },
          },
        },
      },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        id_ciudad: true,
        ciudades: {
          select: { id: true, nombre: true },
        },
        salas: {
          where: {
            funciones: {
              some: {
                id_pelicula: peliculaId,
                estado: EstadoFuncion.PROGRAMADA,
              },
            },
          },
          select: {
            id: true,
            nombre: true,
            funciones: {
              where: {
                id_pelicula: peliculaId,
                estado: EstadoFuncion.PROGRAMADA,
              },
              select: {
                id: true,
                fecha_hora: true,
                estado: true,
              },
              orderBy: { fecha_hora: 'asc' },
            },
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findFuncionesByPeliculaAndCine(
    peliculaIdParam: string,
    cineIdParam: string,
  ) {
    const peliculaId = this.parseId(peliculaIdParam);
    const cineId = this.parseId(cineIdParam);

    const [pelicula, cine] = await Promise.all([
      this.prisma.peliculas.findUnique({
        where: { id: peliculaId },
        select: { id: true, titulo: true },
      }),
      this.prisma.cines.findUnique({
        where: { id: cineId },
        select: { id: true, nombre: true },
      }),
    ]);
    if (!pelicula) {
      throw new NotFoundException('Película no encontrada');
    }
    if (!cine) {
      throw new NotFoundException('Cine no encontrado');
    }

    const funciones = await this.prisma.funciones.findMany({
      where: {
        id_pelicula: peliculaId,
        estado: EstadoFuncion.PROGRAMADA,
        fecha_hora: { gte: new Date() },
        salas: { id_cine: cineId },
      },
      select: {
        id: true,
        fecha_hora: true,
        estado: true,
        salas: { select: { id: true, nombre: true } },
        asientosFuncions: { select: { estado: true } },
      },
      orderBy: { fecha_hora: 'asc' },
    });

    return {
      pelicula: { id: pelicula.id.toString(), titulo: pelicula.titulo },
      cine: { id: cine.id.toString(), nombre: cine.nombre },
      funciones: funciones.map((f) => {
        const total = f.asientosFuncions.length;
        const disponibles = f.asientosFuncions.filter(
          (a) => (a.estado as EstadoAsiento) === EstadoAsiento.DISPONIBLE,
        ).length;
        const bloqueados = f.asientosFuncions.filter(
          (a) => (a.estado as EstadoAsiento) === EstadoAsiento.BLOQUEADO,
        ).length;
        const reservados = f.asientosFuncions.filter(
          (a) => (a.estado as EstadoAsiento) === EstadoAsiento.RESERVADO,
        ).length;
        const ocupados = f.asientosFuncions.filter(
          (a) => (a.estado as EstadoAsiento) === EstadoAsiento.OCUPADO,
        ).length;
        return {
          id: f.id.toString(),
          fecha_hora: f.fecha_hora,
          estado: f.estado,
          sala: { id: f.salas.id.toString(), nombre: f.salas.nombre },
          asientos: {
            total,
            disponibles,
            bloqueados,
            reservados,
            ocupados,
          },
        };
      }),
    };
  }

  async toggleActivo(id: string, auditorId: bigint) {
    const peliculaId = this.parseId(id);

    const existing = await this.prisma.peliculas.findUnique({
      where: { id: peliculaId },
      select: { activo: true, id_usuario: true, titulo: true },
    });
    if (!existing) {
      throw new NotFoundException('Película no encontrada');
    }

    const updated = await this.prisma.peliculas.update({
      where: { id: peliculaId },
      data: { activo: !existing.activo },
      select: { id: true, activo: true },
    });

    await this.auditLog.registrar({
      id_usuario: existing.id_usuario,
      id_auditor: auditorId,
      accion: 'PELICULA_TOGGLE',
      detalle: `Película ${peliculaId.toString()} (${existing.titulo}) toggled a ${!existing.activo}`,
    });

    return updated;
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
