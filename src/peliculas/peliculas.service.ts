import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class PeliculasService {
  private readonly logger = new Logger(PeliculasService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(createPeliculaDto: CreatePeliculaDto) {
    const pelicula = await this.prisma.peliculas.create({
      data: { ...createPeliculaDto },
      include: {
        generos: { select: { nombre: true } },
      },
    });

    // Obtener todos los usuarios activos para notificar
    const usuarios = await this.prisma.usuarios.findMany({
      where: { estado: 'activo', notificaciones_activas: true },
      select: { nombre: true, email: true },
    });

    // Enviar emails sin bloquear la respuesta
    await Promise.allSettled(
      usuarios.map((u) =>
        this.emailService.sendNuevaPelicula(
          u.email,
          u.nombre,
          pelicula.titulo,
          pelicula.generos?.nombre ?? 'Sin género',
          pelicula.fecha_estreno ?? new Date(),
          `${process.env.APP_URL}/peliculas/${pelicula.id}`,
        ),
      ),
    ).then((resultados) => {
      const fallidos = resultados.filter((r) => r.status === 'rejected').length;
      if (fallidos > 0) {
        this.logger.error(`${fallidos} email(s) de nueva película fallaron`);
      }
    });

    return pelicula;
  }

  async findAll() {
    const peliculas = await this.prisma.peliculas.findMany({
      include: {
        idiomas: { select: {nombre: true} },
        generos: { select: {nombre: true} },
        funciones: {
          select: {
            id: true,
            id_pelicula: true,
            fecha_hora: true,
            estado: true,
            formato: true,
            salas: {
              select: {
                id: true,
                nombre: true,
                cines: {
                  select: {
                    id: true,
                    nombre: true,
                    ciudades: { select: {nombre: true} }
                  }
                }
              }
            },
            asientosFuncions: { select: { estado: true } },
          }
        }
      }
    });

    // Cada función expone cuántos asientos quedan disponibles, para que el
    // frontend pueda marcarla como "Función Llena" sin pedir el detalle de
    // cada asiento.
    return peliculas.map((pelicula) => ({
      ...pelicula,
      funciones: pelicula.funciones.map(({ asientosFuncions, ...funcion }) => ({
        ...funcion,
        asientos_disponibles: asientosFuncions.filter(
          (a) => a.estado === 'disponible',
        ).length,
      })),
    }));
  }

  findOne(id: number) {
    return this.prisma.peliculas.findUnique({
      where: { id },
      include: {
        generos: true,
        idiomas: true,
      },
    });
  }

  update(id: number, updatePeliculaDto: UpdatePeliculaDto) {
    return this.prisma.peliculas.update({
      where: { id },
      data: { ...updatePeliculaDto },
    });
  }

  async updateEstado(id: number, activo: boolean) {
    const pelicula = await this.prisma.peliculas.findUnique({ where: { id } });
    if (!pelicula) throw new NotFoundException('Película no encontrada');

    return this.prisma.peliculas.update({
      where: { id },
      data: { activo },
    });
  }

  search(filtros: {
    titulo?: string;
    genero?: string;
    ciudad?: string;
    fecha?: string;
  }) {
    const { titulo, genero, ciudad, fecha } = filtros;

    return this.prisma.peliculas.findMany({
      where: {
        ...(titulo && {
          titulo: { contains: titulo, mode: 'insensitive' },
        }),
        ...(genero && {
          generos: { nombre: { equals: genero, mode: 'insensitive' } },
        }),
        ...(ciudad && {
          funciones: {
            some: {
              salas: {
                cines: { ciudades: { nombre: { equals: ciudad, mode: 'insensitive' } } },
              },
            },
          },
        }),
        ...(fecha && { fecha_estreno: new Date(fecha) }),
      },
      include: {
        generos: { select: { nombre: true } },
        idiomas: { select: { nombre: true } },
      },
      orderBy: { titulo: 'asc' },
    });
  }

  remove(id: number) {
    return this.prisma.peliculas.delete({
      where: { id },
    });
  }

  async uploadPoster(id: number, file: { filename: string }) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');

    const pelicula = await this.prisma.peliculas.findUnique({ where: { id } });
    if (!pelicula) throw new NotFoundException('Película no encontrada');

    const apiUrl =
      process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;

    return this.prisma.peliculas.update({
      where: { id },
      data: { poster_url: `${apiUrl}/uploads/posters/${file.filename}` },
    });
  }

  async getFuncionesByCine(id_pelicula: number, id_cine: number) {
    const pelicula = await this.prisma.peliculas.findUnique({
      where: { id: id_pelicula },
    });
    if (!pelicula) throw new NotFoundException('Película no encontrada');

    const funciones = await this.prisma.funciones.findMany({
      where: {
        id_pelicula,
        salas: { id_cine },
        fecha_hora: { gte: new Date() },
        estado: { not: 'cancelada' },
      },
      include: {
        salas: {
          select: { id: true, nombre: true, filas: true, columnas: true },
        },
        asientosFuncions: {
          select: { estado: true },
        },
      },
      orderBy: { fecha_hora: 'asc' },
    });

    return funciones.map(({ asientosFuncions, ...funcion }) => ({
      ...funcion,
      asientos: {
        total: asientosFuncions.length,
        disponibles: asientosFuncions.filter((a) => a.estado === 'disponible')
          .length,
        ocupados: asientosFuncions.filter((a) => a.estado === 'ocupado').length,
      },
    }));
  }
}
