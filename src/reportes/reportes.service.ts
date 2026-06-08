import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReporteReservasQueryDto } from './dto/reporte-reservas.dto';
import { ReportePagosQueryDto } from './dto/reporte-pagos.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerReporteReservas(query: ReporteReservasQueryDto) {
    const { id_pelicula, id_cine, fecha, estado, page=1, limit=10 } = query;
    
    const skip = (page - 1) * limit;

    const where: Prisma.ReservasWhereInput = {};

    if (estado) {
      where.estado = estado;
    }

    if (id_pelicula || id_cine || fecha) {
      where.funciones = {};

      if (id_pelicula) {
        where.funciones.id_pelicula = BigInt(id_pelicula);
      }

      if (id_cine) {
        where.funciones.salas = {
          id_cine: BigInt(id_cine)
        };
      }

      if (fecha) {
        const inicioDia = new Date(`${fecha}T00:00:00.000Z`);
        const finDia = new Date(`${fecha}T23:59:59.999Z`);

        where.funciones.fecha_hora = {
          gte: inicioDia,
          lte: finDia
        };
      }
    }

    const [totalItems, reservas] = await this.prisma.$transaction([
      this.prisma.reservas.count({ where }),
      this.prisma.reservas.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }, 
        include: {
          funciones: {
            include: {
              peliculas: {
                select: {
                  id: true,
                  titulo: true
                }
              },
              salas: {
                include: {
                  cines: {
                    select: {
                      id: true,
                      nombre: true
                    }
                  }
                }
              }
            }
          },
          pagos: {
            select: {
              monto_final: true,
              metodo: true,
              estado: true
            }
          }
        }
      })
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: reservas,
      meta: {
        total_items: totalItems,
        items_per_page: limit,
        current_page: page,
        total_pages: totalPages,
        has_next_page: page < totalPages,
        has_previous_page: page > 1
      }
    };
  }

  async obtenerReportePagos(query: ReportePagosQueryDto) {
    const { fecha_inicio, fecha_fin, estado } = query;

    const where: Prisma.PagosWhereInput = {};

    if (estado) {
      where.estado = estado;
    }

    if (fecha_inicio || fecha_fin) {
      where.created_at = {};
      
      if (fecha_inicio) {
        where.created_at.gte = new Date(`${fecha_inicio}T00:00:00.000Z`);
      }
      
      if (fecha_fin) {
        where.created_at.lte = new Date(`${fecha_fin}T23:59:59.999Z`);
      }
    }

    const [pagos, totalesGenerales] = await this.prisma.$transaction([
      this.prisma.pagos.findMany({
        where,
        orderBy: { created_at: 'desc' },
        include: {
          reservas: {
            select: {
              numero_reserva: true,
              usuarios: {
                select: { nombre: true, email: true }
              }
            }
          }
        }
      }),
      this.prisma.pagos.aggregate({
        where,
        _sum: {
          monto_original: true,
          monto_descuento: true,
          monto_final: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const desgloseMetodos = await this.prisma.pagos.groupBy({
      by: ['metodo'],
      where,
      _sum: {
        monto_final: true,
      },
      _count: {
        id: true, 
      },
      orderBy: {
        metodo: 'asc',
      },
    });

    return {
      totales_agregados: {
        total_transacciones: totalesGenerales._count.id,
        subtotal_bruto: totalesGenerales._sum.monto_original,
        total_descuentos: totalesGenerales._sum.monto_descuento,
        total_recaudado_neto: totalesGenerales._sum.monto_final
      },
      desglose_por_metodo: desgloseMetodos.map(grupo => ({
        metodo: grupo.metodo,
        cantidad_pagos: grupo._count.id,
        monto_total: grupo._sum.monto_final,
      })),
      detalle_pagos: pagos,
    };
  }
}