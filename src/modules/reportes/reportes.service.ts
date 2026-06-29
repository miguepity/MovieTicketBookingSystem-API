import { Injectable } from '@nestjs/common';
import {
  Prisma,
  ReservaEstado,
  PagoEstado,
  ReembolsoEstado,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoReembolso } from '../../common/enums/estado-reembolso.enum';
import { ListReporteReservasQueryDto } from './dto/list-reportes-reservas-query.dto';
import { ReportesPagosPageResponseDto } from './dto/reportes-pagos-page.response.dto';
import { ReportesReservasListItemResponseDto } from './dto/reportes-reservas-list-item.response.dto';
import { ListReportePagosQueryDto } from './dto/list-reportes-pagos-query.dto';
import { ReportesReservasPageResponseDto } from './dto/reportes-reservas-page.response.dto';
import { ReportesPagosListItemResponseDto } from './dto/reportes-pagos-list-item.response.dto';
import { CancelacionesQueryDto } from './dto/cancelaciones-query.dto';

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
    reservaAsientos: true;
    pagos: { orderBy: { created_at: 'desc' }; include: { reembolsos: true } };
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
  reservaAsientos: true,
  pagos: { orderBy: { created_at: 'desc' }, include: { reembolsos: true } },
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

  async cancelaciones(q: CancelacionesQueryDto) {
    // Build date filter
    const dateFilter: Record<string, Date> = {};
    if (q.fecha_desde) dateFilter.gte = new Date(q.fecha_desde);
    if (q.fecha_hasta) dateFilter.lte = new Date(q.fecha_hasta);

    // Base where — no estado filter (for total count)
    const baseWhere: any = {};
    if (Object.keys(dateFilter).length) baseWhere.created_at = dateFilter;
    if (q.id_cine) {
      baseWhere.funciones = {
        salas: { id_cine: BigInt(q.id_cine) },
      };
    }

    const canceladaWhere: any = { ...baseWhere, estado: ReservaEstado.cancelada };

    const [totalReservas, totalCanceladas] = await Promise.all([
      this.prisma.reservas.count({ where: baseWhere }),
      this.prisma.reservas.count({ where: canceladaWhere }),
    ]);

    const tasa = totalReservas > 0 ? totalCanceladas / totalReservas : 0;

    // ── por_cine ──────────────────────────────────────────────────────────────
    const cancByFuncion = await this.prisma.reservas.groupBy({
      by: ['id_funcion'],
      where: canceladaWhere,
      _count: { _all: true },
    });

    const funcionIds = cancByFuncion.map((r) => r.id_funcion);
    const funciones =
      funcionIds.length > 0
        ? await this.prisma.funciones.findMany({
            where: { id: { in: funcionIds } },
            include: { salas: { include: { cines: true } } },
          })
        : [];

    const cineMap = new Map<string, { nombre: string; count: number }>();
    for (const r of cancByFuncion) {
      const f = funciones.find((x) => x.id === r.id_funcion);
      if (!f) continue;
      const key = String(f.salas.cines.id);
      const entry = cineMap.get(key) ?? {
        nombre: f.salas.cines.nombre,
        count: 0,
      };
      entry.count += r._count._all;
      cineMap.set(key, entry);
    }
    const por_cine = [...cineMap.values()].sort((a, b) => b.count - a.count);

    // ── por_politica ──────────────────────────────────────────────────────────
    const reembByPolitica = await this.prisma.reembolsos.groupBy({
      by: ['id_politica'],
      where: { estado: { not: ReembolsoEstado.rechazado } },
      _count: { _all: true },
    });

    const politicaIds = reembByPolitica
      .map((r) => r.id_politica)
      .filter(Boolean) as bigint[];

    const politicas =
      politicaIds.length > 0
        ? await this.prisma.politicaCancelacion.findMany({
            where: { id: { in: politicaIds } },
          })
        : [];

    const por_politica = reembByPolitica
      .map((r) => ({
        nombre:
          politicas.find((p) => p.id === r.id_politica)?.nombre ??
          '(sin política)',
        count: r._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    // ── tendencia_30d ──────────────────────────────────────────────────────────
    const thirtyAgo = new Date(Date.now() - 30 * 86_400_000);
    const recent = await this.prisma.reservas.findMany({
      where: { estado: ReservaEstado.cancelada, created_at: { gte: thirtyAgo } },
      select: { created_at: true },
    });

    const byDate = new Map<string, number>();
    for (const r of recent) {
      const key = r.created_at.toISOString().slice(0, 10);
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
    }
    const tendencia_30d = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, count]) => ({ fecha, count }));

    return {
      total_canceladas: totalCanceladas,
      tasa,
      por_politica,
      por_cine,
      tendencia_30d,
    };
  }

  private buildReservasWhere(
    query: ListReporteReservasQueryDto,
  ): Prisma.ReservasWhereInput {
    const {
      estado,
      pelicula,
      cine,
      fecha,
      search,
      idCine,
      idCiudad,
      idPelicula,
      desde,
      hasta,
    } = query;

    const where: Prisma.ReservasWhereInput = {};
    const funcionesFilter: Prisma.FuncionesWhereInput = {};
    const salasFilter: Prisma.SalasWhereInput = {};
    const cinesFilter: Prisma.CinesWhereInput = {};

    if (estado) where.estado = estado as ReservaEstado;

    if (pelicula) {
      funcionesFilter.peliculas = {
        titulo: { contains: pelicula, mode: 'insensitive' },
      };
    }

    if (cine) {
      cinesFilter.nombre = { contains: cine, mode: 'insensitive' };
    }

    if (idPelicula) funcionesFilter.id_pelicula = BigInt(idPelicula);
    if (idCine) salasFilter.id_cine = BigInt(idCine);
    if (idCiudad) cinesFilter.id_ciudad = BigInt(idCiudad);

    if (Object.keys(cinesFilter).length > 0) salasFilter.cines = cinesFilter;
    if (Object.keys(salasFilter).length > 0) funcionesFilter.salas = salasFilter;
    if (Object.keys(funcionesFilter).length > 0) where.funciones = funcionesFilter;

    if (search) {
      where.OR = [
        { numero_reserva: { contains: search, mode: 'insensitive' } },
        { usuarios: { nombre: { contains: search, mode: 'insensitive' } } },
        { usuarios: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const range = this.rangeFromQuery(desde, hasta, fecha);
    if (range) where.created_at = range;

    return where;
  }

  private rangeFromQuery(
    desde?: string,
    hasta?: string,
    fecha?: string,
  ): { gte?: Date; lte?: Date; lt?: Date } | undefined {
    const out: { gte?: Date; lte?: Date; lt?: Date } = {};
    if (desde) {
      const d = new Date(desde);
      if (!Number.isNaN(d.getTime())) out.gte = d;
    }
    if (hasta) {
      const d = new Date(hasta);
      if (!Number.isNaN(d.getTime())) out.lte = d;
    }
    if (out.gte || out.lte) return out;
    return this.dayRange(fecha);
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
    const pagoExitoso = reservas.pagos.find((p) => p.estado === PagoEstado.exitoso);
    const montoTotal = pagoExitoso ? Number(pagoExitoso.monto_final) : 0;
    const montoReembolsado = pagoExitoso
      ? pagoExitoso.reembolsos
          .filter((r) => r.estado === EstadoReembolso.PROCESADO)
          .reduce((sum, r) => sum + Number(r.monto), 0)
      : 0;

    return {
      id: reservas.id.toString(),
      numeroReserva: reservas.numero_reserva,
      estado: reservas.estado,
      usuario: {
        id: reservas.usuarios.id.toString(),
        nombre: reservas.usuarios.nombre,
        email: reservas.usuarios.email,
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
      numAsientos: reservas.reservaAsientos.length,
      montoTotal,
      montoReembolsado,
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
      'Email',
      'Pelicula',
      'Cine',
      'Sala',
      'Fecha',
      'Asientos',
      'Total',
    ];

    const rows = reservas.map((r) => {
      const pagoExitoso = r.pagos.find((p) => p.estado === PagoEstado.exitoso);
      const montoTotal = pagoExitoso ? Number(pagoExitoso.monto_final) : 0;
      return [
        r.id.toString(),
        r.numero_reserva,
        r.estado,
        r.usuarios.nombre,
        r.usuarios.email,
        r.funciones.peliculas.titulo,
        r.funciones.salas.cines.nombre,
        r.funciones.salas.nombre,
        r.funciones.fecha_hora.toISOString(),
        r.reservaAsientos.length.toString(),
        montoTotal.toFixed(2),
      ];
    });

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
