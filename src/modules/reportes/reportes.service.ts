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

  async findAllReservas(query: ListReporteReservasQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const all = await this.getReservasLogic(query);

    const total = all.length;

    const paginated = all.slice((page - 1) * limit, page * limit);
    if (paginated.length === 0) {
      throw new NotFoundException('No se encontraron reservas');
    }

    return {
      data: paginated.map((r) => this.toListItem(r)),
      total,
      page,
      limit,
    };
  }

  async exportarReservas(query: ListReporteReservasQueryDto) {
    const reservas = await this.getReservasLogic(query);
    return this.toCsv(reservas);
  }

  private async getReservasLogic(query: ListReporteReservasQueryDto) {
    const { estado, pelicula, cine, fecha } = query;

    const where: Prisma.ReservasWhereInput = {};
    const funcionesFilter: Prisma.FuncionesWhereInput = {};

    if (estado) where.estado = estado;

    if (pelicula) {
      funcionesFilter.peliculas = {
        titulo: { contains: pelicula, mode: 'insensitive' },
      };
    }

    if (cine) {
      funcionesFilter.salas = {
        cines: {
          nombre: { contains: cine, mode: 'insensitive' },
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

    return this.prisma.reservas.findMany({
      where,
      include: {
        usuarios: true,
        funciones: {
          include: {
            peliculas: true,
            salas: {
              include: { cines: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
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

  private toCsv(reservas: any[]): string {
    const headers = [
      'ID',
      'Reserva',
      'Estado',
      'Usuario',
      'Pelicula',
      'Cine',
      'Fecha',
    ];

    const rows = reservas.map((r) => [
      r.id.toString(),
      r.numero_reserva,
      r.estado,
      r.usuarios.nombre,
      r.funciones.peliculas.titulo,
      r.funciones.salas.cines.nombre,
      r.funciones.fecha_hora.toISOString(),
    ]);

    return [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(','),
      ),
    ].join('\n');
  }
}
