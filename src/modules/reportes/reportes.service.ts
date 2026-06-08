import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ListReporteReservasQueryDto } from './dto/list-reportes-reservas-query.dto';
import { ReportesPagosPageResponseDto } from './dto/reportes-pagos-page.response.dto';
import { ReportesReservasListItemResponseDto } from './dto/reportes-reservas-list-item.response.dto';
import { ListReportePagosQueryDto } from './dto/list-reportes-pagos-query.dto';
import { ReportesReservasPageResponseDto } from './dto/reportes-reservas-page.response.dto';
import { ReportesPagosListItemResponseDto } from './dto/reportes-pagos-list-item.response.dto';

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

type PagosWithRelations = Prisma.PagosGetPayload<{
  include: {
    reservas: true;
    cupones: true;
    reembolsos: true;
  };
}>;

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async historialPagos(
    query: ListReportePagosQueryDto,
  ): Promise<ReportesPagosPageResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.PagosWhereInput = {
      ...(query.estado && { estado: query.estado }),
      ...(query.fecha && {
        created_at: {
          gte: new Date(query.fecha),
        },
      }),
    };

    const include = {
      reservas: true,
      cupones: true,
      reembolsos: true,
    } satisfies Prisma.PagosInclude;

    const [total, pagos, aggregates] = await this.prisma.$transaction([
      this.prisma.pagos.count({ where }),

      this.prisma.pagos.findMany({
        where,
        include,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),

      this.prisma.pagos.aggregate({
        where,
        _sum: {
          monto_original: true,
          monto_final: true,
        },
      }),
    ]);

    const data = pagos.map((p) => this.toListPagosItem(p));

    if (pagos.length === 0) {
      throw new NotFoundException(
        'No se encontraron pagos con los filtros aplicados',
      );
    }

    return {
      data,
      total,
      page,
      limit,
      resumen: {
        totalMontoOriginal: Number(aggregates._sum.monto_original ?? 0),
        totalMontoFinal: Number(aggregates._sum.monto_final ?? 0),
      },
    };
  }

  async findAllReservas(
    query: ListReporteReservasQueryDto,
  ): Promise<ReportesReservasPageResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const all = await this.getReservasLogic(query);

    const total = all.length;

    const paginated = all.slice((page - 1) * limit, page * limit);
    if (paginated.length === 0) {
      throw new NotFoundException('No se encontraron reservas');
    }

    return {
      data: paginated.map((r) => this.toListReservasItem(r)),
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

  private toListReservasItem(
    reservas: ReservaWithRelations,
  ): ReportesReservasListItemResponseDto {
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

  private toListPagosItem(
    pagos: PagosWithRelations,
  ): ReportesPagosListItemResponseDto {
    return {
      id: pagos.id.toString(),
      montoOriginal: Number(pagos.monto_original),
      montoFinal: Number(pagos.monto_final),
      metodo: pagos.metodo,
      referenciaExterna: pagos.referencia_externa,
      estado: pagos.estado,
      reserva: {
        id: pagos.reservas.id.toString(),
        numeroReserva: pagos.reservas.numero_reserva,
      },
      cupon: pagos.cupones
        ? {
            id: pagos.cupones.id.toString(),
            codigo: pagos.cupones.codigo,
          }
        : undefined,
      reembolso: pagos.reembolsos?.[0]
        ? {
            id: pagos.reembolsos[0].id.toString(),
            montoReembolso: Number(pagos.reembolsos[0].monto),
          }
        : undefined,
      createdAt: pagos.created_at,
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
