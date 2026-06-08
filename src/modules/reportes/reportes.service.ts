import { Injectable, NotFoundException } from '@nestjs/common';
import { Reservas, Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ListReporteReservasQueryDto } from './dto/list-reportes-query.dto';
import { ReportesReservasPageResponseDto } from './dto/reportes-page.response.dto';
import { ReportesListItemResponseDto } from './dto/reportes-list-item.response.dto';

type ReservaWithRelations = Prisma.ReservasGetPayload<{
  include: {
    usuarios: true;
    funciones: {
      include: {
        peliculas: true;
        salas: {
          include: {
            cines: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllReservas(
    query: ListReporteReservasQueryDto,
  ): Promise<ReportesReservasPageResponseDto> {
    const { estado, pelicula, cine, fecha } = query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ReservasWhereInput = {};
    const funcionesFilter: Prisma.FuncionesWhereInput = {};

    if (estado) {
      where.estado = estado;
    }

    if (pelicula) {
      funcionesFilter.peliculas = {
        titulo: {
          contains: pelicula,
          mode: 'insensitive',
        },
      };
    }

    if (cine) {
      funcionesFilter.salas = {
        cines: {
          nombre: {
            contains: cine,
            mode: 'insensitive',
          },
        },
      };
    }

    if (fecha) {
      const date = new Date(fecha);

      if (!isNaN(date.getTime())) {
        where.created_at = {
          gte: new Date(date.setUTCHours(0, 0, 0, 0)),
          lt: new Date(date.setUTCHours(23, 59, 59, 999)),
        };
      }
    }

    if (Object.keys(funcionesFilter).length > 0) {
      where.funciones = funcionesFilter;
    }

    const [total, reservas] = await this.prisma.$transaction([
      this.prisma.reservas.count({ where }),

      this.prisma.reservas.findMany({
        where,

        include: {
          usuarios: true,

          funciones: {
            include: {
              peliculas: true,

              salas: {
                include: {
                  cines: true,
                },
              },
            },
          },
        },

        orderBy: {
          created_at: 'desc',
        },

        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    if (reservas.length === 0) {
      throw new NotFoundException('No se encontraron reservas');
    }
    
    return {
      data: reservas.map((reserva) => this.toListItem(reserva)),
      total,
      page,
      limit,
    };
  }

  exportarReservas() {
    return `This action exports all reservations`;
  }

  private toListItem(
    reservas: ReservaWithRelations,
  ): ReportesListItemResponseDto {
    return {
      id: reservas.id.toString(),
      numero_reserva: reservas.numero_reserva,
      estado: reservas.estado,
      usuario: {
        id: reservas.usuarios.id.toString(),
        nombre: reservas.usuarios.nombre,
      },
      funcion: {
        id: reservas.funciones.id.toString(),
        fecha_hora: reservas.funciones.fecha_hora,
        pelicula: {
          id: reservas.funciones.peliculas.id.toString(),
          titulo: reservas.funciones.peliculas.titulo,
        },
        sala: {
          id: reservas.funciones.salas.id.toString(),
          nombre: reservas.funciones.salas.nombre,
          cine: {
            id: reservas.funciones.salas.cines.id.toString(),
            nombre: reservas.funciones.salas.cines.nombre,
          },
        },
      },
      created_at: reservas.created_at,
      updated_at: reservas.updated_at,
    };
  }
}
