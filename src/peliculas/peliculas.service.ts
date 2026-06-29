import 'multer';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePeliculaDto } from './dto/create-pelicula.dto.js';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto.js';
import { ToggleStatusPeliculaDto } from './dto/toggle-status-pelicula.dto.js';
import { BuscarPeliculaDto } from './dto/buscar-pelicula.dto.js';
import { R2Service } from './r2.service.js';
import { MailService } from '../mail/mail.service.js';
import { buildNewMovieTemplate } from '../mail/templates/new-movie.template.js';

@Injectable()
export class PeliculasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2Service,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreatePeliculaDto, auditorId: number) {
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

      await this.prisma.auditLog.create({
        data: {
          id_usuario: BigInt(auditorId),
          id_auditor: BigInt(auditorId),
          accion: 'PELICULA_CREADA',
          detalle: `Película "${dto.titulo}" creada`,
        },
      });

      return {
        message: 'Película creada exitosamente',
        data: this.serializePelicula(pelicula),
      };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new BadRequestException(
          'El id_usuario, id_idioma o id_genero no existe.',
        );
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdatePeliculaDto, auditorId: number) {
    await this.findOneOrFail(id);

    const pelicula = await this.prisma.peliculas.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo }),
        ...(dto.sinopsis !== undefined && { sinopsis: dto.sinopsis }),
        ...(dto.poster_url !== undefined && { poster_url: dto.poster_url }),
        ...(dto.id_idioma !== undefined && {
          id_idioma: BigInt(dto.id_idioma),
        }),
        ...(dto.id_genero !== undefined && {
          id_genero: BigInt(dto.id_genero),
        }),
        ...(dto.fecha_estreno !== undefined && {
          fecha_estreno: new Date(dto.fecha_estreno),
        }),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        id_usuario: BigInt(auditorId),
        id_auditor: BigInt(auditorId),
        accion: 'PELICULA_ACTUALIZADA',
        detalle: `Película ${id} actualizada`,
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

  async toggleStatus(id: string, dto: ToggleStatusPeliculaDto, auditorId: number) {
    const existing = await this.findOneOrFail(id);

    const pelicula = await this.prisma.peliculas.update({
      where: { id: BigInt(id) },
      data: { activo: !existing.activo },
    });

    await this.prisma.auditLog.create({
      data: {
        id_usuario: BigInt(auditorId),
        id_auditor: BigInt(auditorId),
        accion: pelicula.activo ? 'PELICULA_ACTIVADA' : 'PELICULA_DESACTIVADA',
        detalle: `Película ${id} ${pelicula.activo ? 'activada' : 'desactivada'}`,
      },
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

  async uploadPoster(id: string, file: Express.Multer.File, auditorId: number) {
    await this.findOneOrFail(id);

    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const key = `posters/${id}-${Date.now()}.${ext}`;
    const url = await this.r2.uploadImage(file, key);

    const pelicula = await this.prisma.peliculas.update({
      where: { id: BigInt(id) },
      data: { poster_url: url },
    });

    await this.prisma.auditLog.create({
      data: {
        id_usuario: BigInt(auditorId),
        id_auditor: BigInt(auditorId),
        accion: 'PELICULA_POSTER_ACTUALIZADO',
        detalle: `Poster de película ${id} actualizado`,
      },
    });

    return {
      message: 'Poster actualizado exitosamente',
      data: {
        id: Number(pelicula.id),
        poster_url: pelicula.poster_url,
      },
    };
  }

  async buscar(dto: BuscarPeliculaDto) {
    const where: Record<string, unknown> = { activo: true };

    if (dto.titulo) {
      where.titulo = { contains: dto.titulo, mode: 'insensitive' };
    }
    if (dto.genero) {
      where.id_genero = BigInt(dto.genero);
    }
    if (dto.idioma) {
      where.id_idioma = BigInt(dto.idioma);
    }
    if (dto.fecha_inicio || dto.fecha_fin) {
      const fechaEstreno: Record<string, Date> = {};
      if (dto.fecha_inicio) fechaEstreno.gte = new Date(dto.fecha_inicio);
      if (dto.fecha_fin) fechaEstreno.lte = new Date(dto.fecha_fin);
      where.fecha_estreno = fechaEstreno;
    }
    if (dto.ciudad_id) {
      where.funciones = {
        some: {
          estado: { not: 'CANCELADA' },
          salas: {
            cines: {
              id_ciudad: BigInt(dto.ciudad_id),
            },
          },
        },
      };
    }

    const peliculas = await this.prisma.peliculas.findMany({
      where,
      include: {
        idiomas: true,
        generos: true,
      },
      orderBy: { titulo: 'asc' },
    });

    return {
      message: 'Películas encontradas',
      total: peliculas.length,
      data: peliculas.map((p) => ({
        id: Number(p.id),
        titulo: p.titulo,
        sinopsis: p.sinopsis,
        poster_url: p.poster_url,
        fecha_estreno: p.fecha_estreno,
        genero: p.generos
          ? { id: Number(p.generos.id), nombre: p.generos.nombre }
          : null,
        idioma: p.idiomas
          ? { id: Number(p.idiomas.id), nombre: p.idiomas.nombre }
          : null,
      })),
    };
  }

  async findAll() {
    const peliculas = await this.prisma.peliculas.findMany({
      include: {
        idiomas: true,
        generos: true,
      },
      orderBy: { titulo: 'asc' },
    });

    return {
      message: 'Películas encontradas',
      total: peliculas.length,
      data: peliculas.map((p) => ({
        id: Number(p.id),
        titulo: p.titulo,
        sinopsis: p.sinopsis,
        poster_url: p.poster_url,
        fecha_estreno: p.fecha_estreno,
        activo: p.activo,
        genero: p.generos
          ? { id: Number(p.generos.id), nombre: p.generos.nombre }
          : null,
        idioma: p.idiomas
          ? { id: Number(p.idiomas.id), nombre: p.idiomas.nombre }
          : null,
      })),
    };
  }

  async getCinesByPelicula(id: string) {
    await this.findOneOrFail(id);

    const funciones = await this.prisma.funciones.findMany({
      where: {
        id_pelicula: BigInt(id),
        estado: { not: 'CANCELADA' },
        fecha_hora: { gte: new Date() },
      },
      include: {
        salas: {
          include: {
            cines: {
              include: {
                ciudades: true,
              },
            },
          },
        },
      },
    });

    const cinesMap = new Map<string, object>();
    for (const funcion of funciones) {
      const cine = funcion.salas.cines;
      const key = String(cine.id);
      if (!cinesMap.has(key)) {
        cinesMap.set(key, {
          id: Number(cine.id),
          nombre: cine.nombre,
          direccion: cine.direccion,
          ciudad: {
            id: Number(cine.ciudades.id),
            nombre: cine.ciudades.nombre,
          },
        });
      }
    }

    return {
      message: 'Cines con funciones activas para esta película',
      data: Array.from(cinesMap.values()),
    };
  }

  async notifySubscribedClients(id: string) {
    const pelicula = await this.prisma.peliculas.findUnique({
      where: { id: BigInt(id) },
      include: { generos: true },
    });

    if (!pelicula) {
      throw new NotFoundException(`PelÃ­cula con id ${id} no encontrada`);
    }

    const usuarios = await this.prisma.usuarios.findMany({
      where: {
        notificaciones_activas: true,
        estado: 'ACTIVO',
      },
      select: {
        email: true,
      },
    });

    let enviados = 0;
    const movieUrl = this.buildMovieUrl(id);

    for (const usuario of usuarios) {
      try {
        await this.mailService.sendEmail({
          to: usuario.email,
          subject: `Nueva pelicula: ${pelicula.titulo}`,
          html: buildNewMovieTemplate({
            title: pelicula.titulo,
            genre: pelicula.generos?.nombre,
            releaseDate: pelicula.fecha_estreno,
            link: movieUrl,
          }),
        });
        enviados += 1;
      } catch (error) {
        console.error(`No se pudo enviar email de nueva pelicula a ${usuario.email}.`, error);
      }
    }

    return {
      message: 'Notificacion de nueva pelicula procesada',
      total_suscritos: usuarios.length,
      emails_enviados: enviados,
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

  async buscarFuncionesConAsientos(peliculaId: number, cineId: number) {
    const funciones = await this.prisma.funciones.findMany({
      where: {
        id_pelicula: BigInt(peliculaId),
        salas: {
          id_cine: BigInt(cineId),
        },
      },
      include: {
        salas: {
          select: {
            nombre: true,
            filas: true,
            columnas: true,
            precio: true,
          },
        },
        asientosFuncions: {
          include: {
            asientos: true,
          },
        },
      },
      orderBy: {
        fecha_hora: 'asc',
      },
    });

    if (!funciones || funciones.length === 0) {
      throw new NotFoundException(
        `No hay funciones para la película ${peliculaId} en el cine ${cineId}`,
      );
    }

    const ahora = new Date();
    return funciones.map((funcion) => {
      const mapaAsientosProcesado = funcion.asientosFuncions.map((af) => {
        let estadoReal = af.estado;
        if (
          af.estado === 'BLOQUEADO' &&
          af.bloqueado_hasta &&
          af.bloqueado_hasta < ahora
        ) {
          estadoReal = 'DISPONIBLE';
        }

        return {
          id_asiento_funcion: Number(af.id),
          id_asiento_fisico: Number(af.id_asiento),
          fila: af.asientos.fila.trim(),
          columna: af.asientos.columna,
          codigo: af.asientos.codigo,
          tipo: af.asientos.tipo,
          estado: estadoReal,
          id_usuario: af.id_usuario ? Number(af.id_usuario) : null,
          bloqueado_hasta: af.bloqueado_hasta,
        };
      });

      mapaAsientosProcesado.sort((a, b) => {
        if (a.fila !== b.fila) return a.fila.localeCompare(b.fila);
        return a.columna - b.columna;
      });

      const totalAsientos = mapaAsientosProcesado.length;
      const disponibles = mapaAsientosProcesado.filter(
        (a) => a.estado === 'DISPONIBLE',
      ).length;

      return {
        id_funcion: Number(funcion.id),
        fecha_hora: funcion.fecha_hora,
        estado_funcion: funcion.estado,
        sala: {
          nombre: funcion.salas.nombre,
          total_filas: funcion.salas.filas,
          total_columnas: funcion.salas.columnas,
          precio: Number(funcion.salas.precio),
        },
        resumen_disponibilidad: {
          total: totalAsientos,
          disponibles: disponibles,
          ocupados: totalAsientos - disponibles,
        },
        mapa_asientos: mapaAsientosProcesado,
      };
    });
  }

  private serializePelicula(pelicula: Record<string, unknown>) {
    return JSON.parse(
      JSON.stringify(pelicula, (_key, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      ),
    );
  }

  private buildMovieUrl(id: string) {
    const baseUrl = process.env.MOVIE_DETAIL_BASE_URL ?? 'http://localhost:3000/peliculas';

    return `${baseUrl.replace(/\/$/, '')}/${id}`;
  }
}
