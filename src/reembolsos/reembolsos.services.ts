import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReembolsosBodyDto } from './dto/reembolsos.body.dto';
import { FilterBodyDto } from './dto/reembolsos.filters.dto';

@Injectable()
export class ReembolsosService {
  constructor(private readonly prisma: PrismaService) {}

  async createRembolso(dto: ReembolsosBodyDto) {
    const findPago = await this.prisma.pagos.findUnique({
      where: { id: BigInt(dto.id_pago) },
    });
    if (!findPago) {
      throw new NotFoundException('No se encontró el pago');
    }
    if (findPago.estado === 'Reembolsado') {
      throw new BadRequestException('El pago ya fue reembolsado');
    }
    if (findPago.estado !== 'Completado') {
      throw new BadRequestException(
        'Solo se pueden reembolsar pagos completados',
      );
    }

    const [newRem] = await this.prisma.$transaction([
      this.prisma.reembolsos.create({
        data: {
          id_pago: BigInt(dto.id_pago),
          monto: dto.monto,
          estado: 'Pendiente',
          fecha_procesado: null,
        },
      }),
      this.prisma.pagos.update({
        where: { id: BigInt(dto.id_pago) },
        data: { estado: 'Reembolsado' },
      }),
    ]);

    return {
      message: 'Reembolso creado exitosamente',
      reembolso: newRem,
    };
  }

  async getPaymentHistory(dto: FilterBodyDto) {
    const findPagos = await this.prisma.pagos.findMany({
      where: { estado: dto.estado_pagos },
      include: {
        reservas: {
          select: {
            id: true,
            usuarios: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });
    const findRembolsos = await this.prisma.reembolsos.findMany({
      where: { estado: dto.estado_reembolsos },
    });

    // Fix: filter callbacks were missing `return`, so they always yielded undefined (empty results)
    const filterPagos = dto.fecha_limite_pagos
      ? findPagos.filter(
          (pag) =>
            pag.created_at.getTime() >=
            new Date(dto.fecha_limite_pagos).getTime(),
        )
      : findPagos;

    const filterReembolsos = dto.fecha_limite_reembolsos
      ? findRembolsos.filter(
          (rem) =>
            rem.fecha_procesado != null &&
            rem.fecha_procesado.getTime() >=
              new Date(dto.fecha_limite_reembolsos).getTime(),
        )
      : findRembolsos;

    return {
      pagos: filterPagos,
      reembolsos: filterReembolsos,
    };
  }

  async calcularReembolso(id: number) {
    const reserva = await this.prisma.reservas.findFirst({
      where: { id: BigInt(id) },
      include: {
        funciones: true,
        pagos: { select: { monto_final: true } },
      },
    });
    if (!reserva) {
      throw new NotFoundException('No existe reserva');
    }
    if (reserva.pagos.length === 0) {
      throw new NotFoundException('No existen pagos para esta reserva');
    }

    const tiempoRestante = Math.max(
      0,
      (reserva.funciones.fecha_hora.getTime() - Date.now()) / (1000 * 60 * 60),
    );

    const politica = await this.prisma.politicaCancelacion.findFirst({
      where: {
        horas_antes_minimo: { lte: tiempoRestante },
        OR: [
          { horas_antes_maximo: null },
          { horas_antes_maximo: { gt: tiempoRestante } },
        ],
      },
    });
    if (!politica) {
      throw new NotFoundException('No aplica ninguna politica');
    }

    const montoTotal = Number(reserva.pagos[0].monto_final);
    const porcentaje = Number(politica.porcentaje_reembolso);

    const calculoReembolso = Math.round((montoTotal * porcentaje) / 100 * 100) / 100;

    return {
      reserva: reserva.numero_reserva,
      monto_total: montoTotal,                 
      porcentaje_de_reembolso: porcentaje,      
      monto_de_reembolso: calculoReembolso,
    };
  }

  async cambiarEstadorReembolso(id: number, estado: string) {
    const reembolso = await this.prisma.reembolsos.findUnique({
      where: { id: BigInt(id) },
    });

    if (!reembolso) throw new NotFoundException(`Reembolso #${id} no encontrado`);
    
    await this.prisma.reembolsos.update({
      where: {id: BigInt(id)},
      data: {estado, fecha_procesado: new Date()}
    });

    return {message: 'Reembolso actualizado con exito.'};
  }
}
