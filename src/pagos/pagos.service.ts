import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePagosDto } from './dtos/create-pagos.dto';
import { CreatePagoEfectivoDto } from './dtos/create-pagos-efectivo.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { buildReservationConfirmationTemplate } from '../mail/templates/reservation-confirmation.template';

@Injectable()
export class PagosService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mailService: MailService,
    ) {}

  async procesarPago(createPagoDto: CreatePagosDto, auditorId?: number) {
    const {
      id_reserva,
      id_cupon,
      monto_original,
      monto_descuento,
      monto_final,
      metodo,
      referencia_externa,
    } = createPagoDto;

    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(id_reserva) },
      include: { reservaAsientos: true },
    });

    if (!reserva) {
      throw new NotFoundException(`La reserva con ID ${id_reserva} no existe.`);
    }

    if (reserva.estado === 'PAGADA') {
      throw new BadRequestException(
        'Esta reserva ya ha sido pagada previamente.',
      );
    }
    if (reserva.estado === 'CANCELADA') {
      throw new BadRequestException(
        'No se puede pagar una reserva que ha sido cancelada.',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      if (id_cupon) {
        const cupon = await tx.cupones.findUnique({
          where: { id: BigInt(id_cupon) },
        });

        if (
          !cupon ||
          !cupon.activo ||
          new Date(cupon.fecha_expiracion) < new Date() ||
          (cupon.usos_maximos !== null && cupon.usos_actuales >= cupon.usos_maximos)
        ) {
          throw new BadRequestException('El cupón ya no es válido o ha alcanzado su límite de usos.');
        }

        await tx.cupones.update({
          where: { id: BigInt(id_cupon) },
          data: { usos_actuales: { increment: 1 } },
        });
      }

      const pago = await tx.pagos.create({
        data: {
          id_reserva: BigInt(id_reserva),
          id_cupon: id_cupon ? BigInt(id_cupon) : null,
          monto_original: new Prisma.Decimal(monto_original),
          monto_descuento: new Prisma.Decimal(monto_descuento),
          monto_final: new Prisma.Decimal(monto_final),
          metodo,
          estado: 'APROBADO',
          referencia_externa,
        },
      });

      const reservaActualizada = await tx.reservas.update({
        where: { id: BigInt(id_reserva) },
        data: { estado: 'PAGADA' },
      });

      const asientosIds = reserva.reservaAsientos.map(
        (ra) => ra.id_asiento_funcion,
      );

      if (asientosIds.length > 0) {
        await tx.asientosFuncion.updateMany({
          where: { id: { in: asientosIds } },
          data: { estado: 'OCUPADO' },
        });
      }

      await tx.auditLog.create({
        data: {
          id_usuario: reserva.id_usuario,
          id_auditor: auditorId ? BigInt(auditorId) : reserva.id_usuario,
          accion: 'PAGO_PROCESADO',
          detalle: `Pago ${metodo} por ${monto_final} aprobado para reserva ${id_reserva}`,
        },
      });

      return {
        message: 'Pago procesado y reserva confirmada con éxito.',
        pago,
        reserva: reservaActualizada,
      };
    });

    await this.notifyPaymentSuccess(id_reserva, monto_final);

    return result;
  }

  async procesarPagoEfectivo(
    createPagoEfectivoDto: CreatePagoEfectivoDto,
    auditorId: number,
  ) {
    const {
      id_reserva,
      id_cupon,
      monto_original,
      monto_descuento,
      monto_final,
    } = createPagoEfectivoDto;

    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(id_reserva) },
      include: { reservaAsientos: true },
    });

    if (!reserva) {
      throw new NotFoundException(`La reserva con ID ${id_reserva} no existe.`);
    }

    if (reserva.estado === 'PAGADA') {
      throw new BadRequestException(
        'Esta reserva ya ha sido pagada previamente.',
      );
    }
    if (reserva.estado === 'CANCELADA') {
      throw new BadRequestException(
        'No se puede pagar una reserva que ha sido cancelada.',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      if (id_cupon) {
        const cupon = await tx.cupones.findUnique({
          where: { id: BigInt(id_cupon) },
        });

        if (
          !cupon ||
          !cupon.activo ||
          new Date(cupon.fecha_expiracion) < new Date() ||
          (cupon.usos_maximos !== null && cupon.usos_actuales >= cupon.usos_maximos)
        ) {
          throw new BadRequestException('El cupón ya no es válido o ha alcanzado su límite de usos.');
        }

        await tx.cupones.update({
          where: { id: BigInt(id_cupon) },
          data: { usos_actuales: { increment: 1 } },
        });
      }
      
      const pago = await tx.pagos.create({
        data: {
          id_reserva: BigInt(id_reserva),
          id_cupon: id_cupon ? BigInt(id_cupon) : null,
          monto_original: new Prisma.Decimal(monto_original),
          monto_descuento: new Prisma.Decimal(monto_descuento),
          monto_final: new Prisma.Decimal(monto_final),
          metodo: 'EFECTIVO',
          estado: 'APROBADO',
          referencia_externa: null,
        },
      });

      const reservaActualizada = await tx.reservas.update({
        where: { id: BigInt(id_reserva) },
        data: { estado: 'PAGADA' },
      });

      const asientosIds = reserva.reservaAsientos.map(
        (ra) => ra.id_asiento_funcion,
      );

      if (asientosIds.length > 0) {
        await tx.asientosFuncion.updateMany({
          where: { id: { in: asientosIds } },
          data: { estado: 'OCUPADO' },
        });
      }

      await tx.auditLog.create({
        data: {
          id_usuario: reserva.id_usuario,
          id_auditor: BigInt(auditorId),
          accion: 'PAGO_EFECTIVO_PROCESADO',
          detalle: `Pago efectivo por ${monto_final} aprobado para reserva ${id_reserva} registrado por usuario ${auditorId}`,
        },
      });

      return {
        message: 'Pago procesado y reserva confirmada con éxito.',
        pago,
        reserva: reservaActualizada,
      };
    });

    await this.notifyPaymentSuccess(id_reserva, monto_final);

    return result;
  }

  async obtenerPagos() {
    return await this.prisma.pagos.findMany();
  }

  async obtenerPagoPorReserva(id_reserva: string) {
    const pago = await this.prisma.pagos.findFirst({
      where: { id_reserva: BigInt(id_reserva) },
    });

    if (!pago) {
      throw new NotFoundException(`El pago con ID ${id_reserva} no existe.`);
    }

    return pago;
  }

  private async notifyPaymentSuccess(idReserva: number, montoFinal: number) {
    try {
      const reserva = await this.prisma.reservas.findUnique({
        where: { id: BigInt(idReserva) },
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
          reservaAsientos: {
            include: {
              asientosfuncion: {
                include: {
                  asientos: true,
                },
              },
            },
          },
        },
      });

      if (!reserva) {
        return;
      }

      await this.mailService.sendEmail({
        to: reserva.usuarios.email,
        subject: 'Confirmacion de reserva',
        html: buildReservationConfirmationTemplate({
          reservationNumber: reserva.numero_reserva,
          movieTitle: reserva.funciones.peliculas.titulo,
          cinemaName: reserva.funciones.salas.cines.nombre,
          seats: reserva.reservaAsientos.map(
            (ra) => ra.asientosfuncion.asientos.codigo,
          ),
          amount: montoFinal,
        }),
      });
    } catch (error) {
      console.error('No se pudo enviar el correo de pago exitoso.', error);
    }
  }
}
