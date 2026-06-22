import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReporteReservasDto } from './dto/reporte-reservas.dto';
import { ReportePagosDto } from './dto/reporte-pagos.dto';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async reporteReservas(dto: ReporteReservasDto) {
    const pagina = Number(dto.pagina ?? 1);
    const limite = Number(dto.limite ?? 10);
    const skip = (pagina - 1) * limite;

    const where: Record<string, unknown> = {};

    if (dto.estado) {
      where.estado = dto.estado;
    }

    if (dto.fecha_inicio || dto.fecha_fin) {
      where.created_at = {
        ...(dto.fecha_inicio && { gte: new Date(dto.fecha_inicio) }),
        ...(dto.fecha_fin && { lte: new Date(dto.fecha_fin + 'T23:59:59Z') }),
      };
    }

    if (dto.id_pelicula) {
      where.funciones = {
        id_pelicula: BigInt(dto.id_pelicula),
      };
    }

    if (dto.id_cine) {
      where.funciones = {
        ...(where.funciones as object),
        salas: {
          id_cine: BigInt(dto.id_cine),
        },
      };
    }

    const [total, reservas] = await Promise.all([
      this.prisma.reservas.count({ where }),
      this.prisma.reservas.findMany({
        where,
        skip,
        take: limite,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          numero_reserva: true,
          estado: true,
          created_at: true,
          updated_at: true,
          usuarios: {
            select: { id: true, nombre: true, email: true },
          },
          funciones: {
            select: {
              id: true,
              fecha_hora: true,
              estado: true,
              peliculas: { select: { id: true, titulo: true } },
              salas: {
                select: {
                  id: true,
                  nombre: true,
                  cines: { select: { id: true, nombre: true } },
                },
              },
            },
          },
          reservaAsientos: { select: { id: true } },
        },
      }),
    ]);

    return {
      total,
      pagina,
      limite,
      total_paginas: Math.ceil(total / limite),
      data: reservas.map((r) => ({
        id: r.id.toString(),
        numero_reserva: r.numero_reserva,
        estado: r.estado,
        created_at: r.created_at,
        updated_at: r.updated_at,
        total_asientos: r.reservaAsientos.length,
        usuario: {
          id: r.usuarios.id.toString(),
          nombre: r.usuarios.nombre,
          email: r.usuarios.email,
        },
        funcion: {
          id: r.funciones.id.toString(),
          fecha_hora: r.funciones.fecha_hora,
          estado: r.funciones.estado,
          pelicula: {
            id: r.funciones.peliculas.id.toString(),
            titulo: r.funciones.peliculas.titulo,
          },
          sala: {
            id: r.funciones.salas.id.toString(),
            nombre: r.funciones.salas.nombre,
            cine: {
              id: r.funciones.salas.cines.id.toString(),
              nombre: r.funciones.salas.cines.nombre,
            },
          },
        },
      })),
    };
  }

  async reportePagos(dto: ReportePagosDto) {
    const pagina = Number(dto.pagina ?? 1);
    const limite = Number(dto.limite ?? 10);
    const skip = (pagina - 1) * limite;

    const where: Record<string, unknown> = {};

    if (dto.estado) {
      where.estado = dto.estado;
    }

    if (dto.fecha_inicio || dto.fecha_fin) {
      where.created_at = {
        ...(dto.fecha_inicio && { gte: new Date(dto.fecha_inicio) }),
        ...(dto.fecha_fin && { lte: new Date(dto.fecha_fin + 'T23:59:59Z') }),
      };
    }

    const [total, pagos] = await Promise.all([
      this.prisma.pagos.count({ where }),
      this.prisma.pagos.findMany({
        where,
        skip,
        take: limite,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          monto_original: true,
          monto_descuento: true,
          monto_final: true,
          metodo: true,
          estado: true,
          referencia_externa: true,
          created_at: true,
          reservas: {
            select: {
              id: true,
              numero_reserva: true,
              usuarios: {
                select: { id: true, nombre: true, email: true },
              },
              funciones: {
                select: {
                  id: true,
                  fecha_hora: true,
                  peliculas: { select: { id: true, titulo: true } },
                  salas: {
                    select: {
                      id: true,
                      nombre: true,
                      cines: { select: { id: true, nombre: true } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      total,
      pagina,
      limite,
      total_paginas: Math.ceil(total / limite),
      data: pagos.map((p) => ({
        id: p.id.toString(),
        monto_original: p.monto_original.toString(),
        monto_descuento: p.monto_descuento.toString(),
        monto_final: p.monto_final.toString(),
        metodo: p.metodo,
        estado: p.estado,
        referencia_externa: p.referencia_externa,
        created_at: p.created_at,
        reserva: {
          id: p.reservas.id.toString(),
          numero_reserva: p.reservas.numero_reserva,
          usuario: {
            id: p.reservas.usuarios.id.toString(),
            nombre: p.reservas.usuarios.nombre,
            email: p.reservas.usuarios.email,
          },
          funcion: {
            id: p.reservas.funciones.id.toString(),
            fecha_hora: p.reservas.funciones.fecha_hora,
            pelicula: {
              id: p.reservas.funciones.peliculas.id.toString(),
              titulo: p.reservas.funciones.peliculas.titulo,
            },
            sala: {
              id: p.reservas.funciones.salas.id.toString(),
              nombre: p.reservas.funciones.salas.nombre,
              cine: {
                id: p.reservas.funciones.salas.cines.id.toString(),
                nombre: p.reservas.funciones.salas.cines.nombre,
              },
            },
          },
        },
      })),
    };
  }
}
