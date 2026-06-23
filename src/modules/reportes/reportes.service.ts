import { Injectable } from '@nestjs/common';
import {
  Prisma,
  ReservaEstado,
  PagoEstado,
} from '../../../generated/prisma/client';
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

const RESERVAS_INCLUDE = {
  usuarios: true,
  funciones: {
    include: {
      peliculas: true,
      salas: { include: { cines: true } },
    },
  },
} satisfies Prisma.ReservasInclude;

const PAGOS_INCLUDE = {
  reservas: true,
  cupones: true,
  reembolsos: true,
} satisfies Prisma.PagosInclude;

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async historialPagos(
    query: ListReportePagosQueryDto,
  ): Promise<ReportesPagosPageResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = this.buildPagosWhere(query);

    const [total, pagos, aggregates] = await this.prisma.$transaction([
      this.prisma.pagos.count({ where }),
      this.prisma.pagos.findMany({
        where,
        include: PAGOS_INCLUDE,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.pagos.aggregate({
        where,
        _sum: {
          monto_original: true,
          monto_final: true,
        },
      }),
    ]);

    return {
      data: pagos.map((p) => this.toListPagosItem(p)),
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

    const where = this.buildReservasWhere(query);

    const [total, reservas] = await this.prisma.$transaction([
      this.prisma.reservas.count({ where }),
      this.prisma.reservas.findMany({
        where,
        include: RESERVAS_INCLUDE,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return {
      data: reservas.map((r) => this.toListReservasItem(r)),
      total,
      page,
      limit,
    };
  }

  async exportarReservas(query: ListReporteReservasQueryDto): Promise<string> {
    const where = this.buildReservasWhere(query);

    const reservas = await this.prisma.reservas.findMany({
      where,
      include: RESERVAS_INCLUDE,
      orderBy: { created_at: 'desc' },
    });

    return this.toCsv(reservas);
  }

  private buildReservasWhere(
    query: ListReporteReservasQueryDto,
  ): Prisma.ReservasWhereInput {
    const { estado, pelicula, cine, fecha } = query;

    const where: Prisma.ReservasWhereInput = {};
    const funcionesFilter: Prisma.FuncionesWhereInput = {};

    if (estado) where.estado = estado as ReservaEstado;

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

    const rango = this.dayRange(fecha);
    if (rango) where.created_at = rango;

    if (Object.keys(funcionesFilter).length > 0) {
      where.funciones = funcionesFilter;
    }

    return where;
  }

  private buildPagosWhere(
    query: ListReportePagosQueryDto,
  ): Prisma.PagosWhereInput {
    const where: Prisma.PagosWhereInput = {};

    if (query.estado) where.estado = query.estado as PagoEstado;

    const rango = this.dayRange(query.fecha);
    if (rango) where.created_at = rango;

    return where;
  }

  private dayRange(fecha?: string): { gte: Date; lt: Date } | undefined {
    if (!fecha) return undefined;

    const parsed = new Date(fecha);
    if (Number.isNaN(parsed.getTime())) return undefined;

    const gte = new Date(parsed);
    gte.setUTCHours(0, 0, 0, 0);

    const lt = new Date(parsed);
    lt.setUTCHours(0, 0, 0, 0);
    lt.setUTCDate(lt.getUTCDate() + 1);

    return { gte, lt };
  }

  private toListReservasItem(
    reservas: ReservaWithRelations,
  ): ReportesReservasListItemResponseDto {
    return {
      id: reservas.id.toString(),
      numeroReserva: reservas.numero_reserva,
      estado: reservas.estado,
      usuario: {
        id: reservas.usuarios.id.toString(),
        nombre: reservas.usuarios.nombre,
      },
      funcion: {
        id: reservas.funciones.id.toString(),
        fechaHora: reservas.funciones.fecha_hora,
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
      createdAt: reservas.created_at,
      updatedAt: reservas.updated_at,
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
      reembolsos: pagos.reembolsos.map((r) => ({
        id: r.id.toString(),
        montoReembolso: Number(r.monto),
      })),
      createdAt: pagos.created_at,
    };
  }

  private toCsv(reservas: ReservaWithRelations[]): string {
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

    const body = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(','),
      ),
    ].join('\r\n');

    return '﻿' + body;
  }
}
