import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservaEstado } from '../../../generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class CalificacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async obtenerMia(idPelicula: bigint, idUsuario: bigint) {
    const elegible = await this.prisma.reservas.findFirst({
      where: {
        id_usuario: idUsuario,
        estado: ReservaEstado.pagada,
        funciones: { id_pelicula: idPelicula, fecha_hora: { lt: new Date() } },
      },
      select: { id: true },
    });

    const calif = await this.prisma.calificacionPelicula.findUnique({
      where: {
        id_pelicula_id_usuario: {
          id_pelicula: idPelicula,
          id_usuario: idUsuario,
        },
      },
      select: { puntuacion: true },
    });

    return {
      elegible: elegible !== null,
      puntuacion: calif?.puntuacion ?? null,
    };
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

    const previa = await this.prisma.calificacionPelicula.findUnique({
      where: {
        id_pelicula_id_usuario: {
          id_pelicula: idPelicula,
          id_usuario: idUsuario,
        },
      },
      select: { puntuacion: true },
    });

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

    await this.auditLog.registrar({
      id_usuario: idUsuario,
      id_auditor: idUsuario,
      accion: previa ? 'CALIFICACION_ACTUALIZAR' : 'CALIFICACION_CREAR',
      entidad: 'CalificacionPelicula',
      entidad_id: idPelicula,
      detalle: `Calificación ${previa ? 'actualizada' : 'creada'} para película ${idPelicula.toString()}: ${puntuacion} estrellas`,
      valor_anterior: previa ? { puntuacion: previa.puntuacion } : undefined,
      valor_nuevo: { puntuacion },
    });

    return {
      puntuacion,
      rating_promedio: peli?.rating_promedio,
      rating_count: peli?.rating_count ?? 0,
    };
  }

  async borrar(idPelicula: bigint, idUsuario: bigint) {
    const previa = await this.prisma.calificacionPelicula.findUnique({
      where: {
        id_pelicula_id_usuario: {
          id_pelicula: idPelicula,
          id_usuario: idUsuario,
        },
      },
      select: { puntuacion: true },
    });

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

    await this.auditLog.registrar({
      id_usuario: idUsuario,
      id_auditor: idUsuario,
      accion: 'CALIFICACION_BORRAR',
      entidad: 'CalificacionPelicula',
      entidad_id: idPelicula,
      detalle: `Calificación borrada para película ${idPelicula.toString()}`,
      valor_anterior: previa ? { puntuacion: previa.puntuacion } : undefined,
    });

    return {
      rating_promedio: peli?.rating_promedio,
      rating_count: peli?.rating_count ?? 0,
    };
  }
}
