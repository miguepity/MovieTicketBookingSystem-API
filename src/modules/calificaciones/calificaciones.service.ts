import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservaEstado } from '../../../generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CalificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerMia(idPelicula: bigint, idUsuario: bigint) {
    const calif = await this.prisma.calificacionPelicula.findUnique({
      where: {
        id_pelicula_id_usuario: {
          id_pelicula: idPelicula,
          id_usuario: idUsuario,
        },
      },
      select: { puntuacion: true },
    });
    if (!calif) throw new NotFoundException('NotFound');
    return { puntuacion: calif.puntuacion };
  }

  async calificar(idPelicula: bigint, idUsuario: bigint, puntuacion: number) {
    const elegible = await this.prisma.reservas.findFirst({
      where: {
        id_usuario: idUsuario,
        estado: ReservaEstado.pagada,
        funciones: { id_pelicula: idPelicula, fecha_hora: { lt: new Date() } },
      },
      select: { id: true },
    });
    if (!elegible)
      throw new ForbiddenException(
        'Forbidden: Debes haber asistido a una función de esta película',
      );

    await this.prisma.calificacionPelicula.upsert({
      where: {
        id_pelicula_id_usuario: {
          id_pelicula: idPelicula,
          id_usuario: idUsuario,
        },
      },
      create: { id_pelicula: idPelicula, id_usuario: idUsuario, puntuacion },
      update: { puntuacion },
    });

    const peli = await this.prisma.peliculas.findUnique({
      where: { id: idPelicula },
      select: { rating_promedio: true, rating_count: true },
    });

    return {
      puntuacion,
      rating_promedio: peli?.rating_promedio,
      rating_count: peli?.rating_count ?? 0,
    };
  }

  async borrar(idPelicula: bigint, idUsuario: bigint) {
    try {
      await this.prisma.calificacionPelicula.delete({
        where: {
          id_pelicula_id_usuario: {
            id_pelicula: idPelicula,
            id_usuario: idUsuario,
          },
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('NotFound');
      throw e;
    }
    const peli = await this.prisma.peliculas.findUnique({
      where: { id: idPelicula },
      select: { rating_promedio: true, rating_count: true },
    });
    return {
      rating_promedio: peli?.rating_promedio,
      rating_count: peli?.rating_count ?? 0,
    };
  }
}
