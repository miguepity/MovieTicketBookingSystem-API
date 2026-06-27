import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservaDto } from './create-reserva.dto';
import { MailService } from '../mail/mail.service';
import { buildReservationCancellationTemplate } from '../mail/templates/reservation-cancellation.template';

import { ReembolsosService } from '../reembolsos/reembolsos.service';

@Injectable()
export class ReservasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly reembolsosService: ReembolsosService,
  ) {}

  async createReserva(createReservaDto: CreateReservaDto, userId: number, userRole: string) {
    const { id_funcion, asientosFuncionIds, id_usuario_cliente } = createReservaDto;

    const clienteId = (userRole === 'RECEPCIONISTA' && id_usuario_cliente) 
                      ? BigInt(id_usuario_cliente) 
                      : BigInt(userId);

    const numeroUnicoReserva = `RES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const ahora = new Date();

    const nuevaReserva = await this.prisma.$transaction(async (tx) => {

      for (const afId of asientosFuncionIds) {

        const asientoFuncion = await tx.asientosFuncion.findUnique({
          where: { id: BigInt(afId) },
        });

        if (!asientoFuncion) {
          throw new NotFoundException(`El asiento-función con ID ${afId} no existe.`);
        }

        if (Number(asientoFuncion.id_funcion) !== id_funcion) {
          throw new BadRequestException(
            `El asiento con ID ${afId} no pertenece a la función ${id_funcion} (pertenece a la función ${asientoFuncion.id_funcion}).`
          );
        }       

        if (asientoFuncion.estado === 'OCUPADO' || asientoFuncion.estado === 'PENDIENTE_DE_PAGO') {
          throw new ConflictException(`El asiento con ID ${afId} ya no se encuentra disponible.`);
        }

        if (
          asientoFuncion.estado === 'BLOQUEADO' && 
          asientoFuncion.bloqueado_hasta && 
          asientoFuncion.bloqueado_hasta >= ahora && 
          Number(asientoFuncion.id_usuario) !== userId 
        ) {
          throw new ConflictException(`El asiento con ID ${afId} está reservado temporalmente en el carrito de otro cliente.`);
        }
      }

      const reserva = await tx.reservas.create({
        data: {
          numero_reserva: numeroUnicoReserva,
          id_usuario: clienteId,
          id_funcion: BigInt(id_funcion),
          estado: 'PENDIENTE_DE_PAGO',
        },
      });

      const registrosIntermedios = asientosFuncionIds.map((afId) => ({
        id_reserva: reserva.id,
        id_asiento_funcion: BigInt(afId),
      }));
      await tx.reservaAsientos.createMany({ data: registrosIntermedios });

      await tx.asientosFuncion.updateMany({
        where: { id: { in: asientosFuncionIds.map((id) => BigInt(id)) } },
        data: {
          estado: 'PENDIENTE_DE_PAGO',
          id_usuario: clienteId,
        },
      });

      await tx.auditLog.create({
        data: {
          id_usuario: clienteId,
          id_auditor: BigInt(userId),
          accion: 'RESERVA_CREADA',
          detalle: `Reserva ${numeroUnicoReserva} creada para función ${id_funcion} con ${asientosFuncionIds.length} asiento(s)`,
        },
      });

      return reserva;
    });

    return {
      message: 'Reserva generada con éxito en estado pendiente de pago.',
      reservaId: Number(nuevaReserva.id),
      codigoTicket: nuevaReserva.numero_reserva,
      estado: nuevaReserva.estado,
    };
  }

  async findAll(userId: number, userRole: string) {
    const filtro = userRole === 'ADMIN' ? {} : { id_usuario: BigInt(userId) };

    return await this.prisma.reservas.findMany({
      where: filtro,
      include: {
        funciones: {
          include: { peliculas: true },
        },
        reservaAsientos: {
          include: {
            asientosfuncion: {
              include: { asientos: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number, userId: number, userRole: string) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(id) },
      include: {
        funciones: { include: { peliculas: true } },
        reservaAsientos: {
          include: { asientosfuncion: { include: { asientos: true } } },
        },
      },
    });

    if (!reserva) throw new NotFoundException(`La reserva con ID ${id} no existe.`);

    if (userRole !== 'ADMIN' && Number(reserva.id_usuario) !== userId) {
      throw new ForbiddenException('No tienes permiso para ver esta reserva.');
    }

    return reserva;
  }

  async cancelarReserva(idReserva: number, userId: number) {
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
        reservaAsientos: true,
        pagos: {
          include: {
            reembolsos: true,
          },
        },
      },
    });

    if (!reserva) throw new NotFoundException(`La reserva con ID ${idReserva} no existe.`);
    if (reserva.estado === 'CANCELADA') throw new BadRequestException('Esta reserva ya se encuentra cancelada.');

    const ahora = new Date();
    const horaFuncion = new Date(reserva.funciones.fecha_hora);
    const diferenciaHoras = (horaFuncion.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    if (diferenciaHoras < 2) {
      throw new BadRequestException(
        'Política de cancelación infringida: No se admiten cancelaciones con menos de 2 horas de anticipación.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.reservas.update({
        where: { id: BigInt(idReserva) },
        data: { estado: 'CANCELADA' },
      });

      const asientosAFacilitar = reserva.reservaAsientos.map((ra) => ra.id_asiento_funcion);

      if (asientosAFacilitar.length > 0) {
        await tx.asientosFuncion.updateMany({
          where: { id: { in: asientosAFacilitar } },
          data: {
            estado: 'DISPONIBLE',
            id_usuario: null,
          },
        });
      }

      const pago = reserva.pagos?.[0];
      if (pago && pago.estado === 'APROBADO') {
        const calculo = await this.reembolsosService.calcularReembolso({ id_pago: Number(pago.id) });
        
        if (Number(calculo.monto_a_reembolsar) > 0) {
            await tx.reembolsos.create({
                data: {
                    id_pago: pago.id,
                    monto: calculo.monto_a_reembolsar,
                    estado: 'PROCESADO',
                    fecha_procesado: new Date(),
                }
            });
            await tx.pagos.update({
                where: { id: pago.id },
                data: { estado: 'REEMBOLSADO' }
            });
        }
      }

      await tx.auditLog.create({
        data: {
          id_usuario: reserva.id_usuario,
          id_auditor: BigInt(userId),
          accion: 'RESERVA_CANCELADA',
          detalle: `Reserva ${idReserva} cancelada y reembolso procesado automáticamente`,
        },
      });
    });

    await this.notifyReservationCancellation(reserva);

    return {
      message: 'Reserva cancelada exitosamente y reembolso procesado.',
      idReserva,
      nuevoEstado: 'CANCELADA',
    };
  }

  private async notifyReservationCancellation(reserva: any) {
    try {
      const pago = reserva.pagos?.[0];
      const reembolso = pago?.reembolsos?.[0];
      const refundStatus = reembolso?.estado ?? (pago ? 'Pendiente de procesamiento' : 'No aplica');

      await this.mailService.sendEmail({
        to: reserva.usuarios.email,
        subject: 'Reserva cancelada',
        html: buildReservationCancellationTemplate({
          reservationNumber: reserva.numero_reserva,
          movieTitle: reserva.funciones.peliculas.titulo,
          cinemaName: reserva.funciones.salas.cines.nombre,
          refundStatus,
          refundAmount: reembolso?.monto,
        }),
      });
    } catch (error) {
      console.error('No se pudo enviar el correo de cancelacion de reserva.', error);
    }
  }
}
