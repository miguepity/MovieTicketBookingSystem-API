import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UploadPosterDto } from './dto/upload-poster.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PeliculasService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private usersService: UsersService,
  ) {}

  async createPelicula(dto: CreatePeliculaDto) {
    if (!dto.fecha_estreno)
      throw new BadRequestException('La fecha de estreno es obligatoria');

    const pelicula = await this.prisma.peliculas.create({
      data: {
        titulo: dto.titulo,
        sinopsis: dto.sinopsis,
        poster_url: dto.poster_url,
        id_idioma: dto.idioma ? BigInt(dto.idioma) : null,
        id_genero: dto.genero ? BigInt(dto.genero) : null,
        fecha_estreno: dto.fecha_estreno,
        id_usuario: BigInt(dto.uploaded_by),
      },
      include: {
        generos: true,
      },
    });

    if (!pelicula.fecha_estreno)
      throw new Error('Error al crear la película: fecha de estreno no válida');

    // Notificar a los usuarios suscritos (sin esperar para no bloquear el API)
    const movieNotificationData = {
      id: pelicula.id.toString(),
      titulo: pelicula.titulo,
      genero: pelicula.generos?.nombre || 'General',
      fecha_estreno: new Date(pelicula.fecha_estreno).toLocaleDateString(),
    };

    this.notifyUsersOfNewMovie(movieNotificationData).catch((error) => {
      console.error(
        'Error al enviar notificaciones para la nueva película:',
        error,
      );
    });

    return pelicula;
  }

  private async notifyUsersOfNewMovie(movie: {
    id: string;
    titulo: string;
    genero: string;
    fecha_estreno: string;
  }) {
    const users = await this.usersService.findUsersForNotifications();

    for (const user of users) {
      void this.mailService.sendNewMovieNotification(
        user.email,
        user.nombre,
        movie,
      );
    }
  }

  async getTitulo(titulo?: string) {
    if (!titulo) {
      return this.prisma.peliculas.findMany({
        where: { activo: true },
      });
    }

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
    const pelicula = await this.prisma.peliculas.findUnique({
      where: { id: BigInt(id) },
    });

    if (!pelicula) {
      throw new NotFoundException(`Película no encontrada`);
    }

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
