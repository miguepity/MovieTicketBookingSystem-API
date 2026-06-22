import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReporteReservasDto } from './dto/reporte-reservas.dto';
import { ReportePagosDto } from './dto/reporte-pagos.dto';

function escapeCsv(val: unknown): string {
  const str = val == null ? '' : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

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

  async exportarReservas(dto: ReporteReservasDto): Promise<string> {
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

    const reservas = await this.prisma.reservas.findMany({
      where,
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
    });

    const headers = [
      'ID Reserva',
      'Número Reserva',
      'Estado',
      'Fecha Creación',
      'Fecha Actualización',
      'Total Asientos',
      'Usuario ID',
      'Usuario Nombre',
      'Usuario Email',
      'Función ID',
      'Función Fecha',
      'Función Estado',
      'Película ID',
      'Película Título',
      'Sala ID',
      'Sala Nombre',
      'Cine ID',
      'Cine Nombre',
    ];

    const rows = reservas.map((r) =>
      [
        r.id.toString(),
        r.numero_reserva,
        r.estado,
        r.created_at.toISOString(),
        r.updated_at.toISOString(),
        r.reservaAsientos.length,
        r.usuarios.id.toString(),
        r.usuarios.nombre,
        r.usuarios.email,
        r.funciones.id.toString(),
        r.funciones.fecha_hora.toISOString(),
        r.funciones.estado,
        r.funciones.peliculas.id.toString(),
        r.funciones.peliculas.titulo,
        r.funciones.salas.id.toString(),
        r.funciones.salas.nombre,
        r.funciones.salas.cines.id.toString(),
        r.funciones.salas.cines.nombre,
      ]
        .map(escapeCsv)
        .join(','),
    );

    return '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
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
