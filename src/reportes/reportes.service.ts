import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReporteReservasQueryDto } from './dto/reporte-reservas.dto';
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
}