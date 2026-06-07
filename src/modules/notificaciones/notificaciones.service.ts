import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PagoExitosoEvent } from 'src/modules/pagos/events/pago-exitoso.event';
import { ReservaCanceladaEvent } from 'src/modules/reservas/events/reserva-cancelada.event';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    private readonly mail: MailService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(PagoExitosoEvent.NAME)
  async onPagoExitoso(event: PagoExitosoEvent): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.log(
        `EMAIL_TRIGGERS_ENABLED=false — skip email pago exitoso (pago=${event.idPago})`,
      );
      return;
    }

    const pago = await this.prisma.pagos.findUnique({
      where: { id: BigInt(event.idPago) },
      include: {
        reservas: {
          include: {
            usuarios: { select: { nombre: true, email: true } },
            funciones: {
              include: {
                peliculas: { select: { titulo: true } },
                salas: { include: { cines: { select: { nombre: true } } } },
              },
            },
            reservaAsientos: {
              include: {
                asientosfuncion: {
                  include: {
                    asientos: { select: { codigo: true, tipo: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!pago) {
      this.logger.warn(`Pago ${event.idPago} no encontrado para email`);
      return;
    }

    const reserva = pago.reservas;
    const funcion = reserva.funciones;
    const fechaFuncion = new Intl.DateTimeFormat('es', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'America/Tegucigalpa',
    }).format(funcion.fecha_hora);

    try {
      await this.mail.sendConfirmacionEmail({
        nombre: reserva.usuarios.nombre,
        email: reserva.usuarios.email,
        numeroReserva: reserva.numero_reserva,
        pelicula: funcion.peliculas.titulo,
        cine: `${funcion.salas.cines.nombre} — Sala ${funcion.salas.nombre}`,
        fechaFuncion,
        asientos: reserva.reservaAsientos.map((ra) => ({
          codigo: ra.asientosfuncion.asientos.codigo,
          tipo: ra.asientosfuncion.asientos.tipo,
        })),
        montoOriginal: pago.monto_original.toFixed(2),
        montoDescuento: pago.monto_descuento.toFixed(2),
        montoFinal: pago.monto_final.toFixed(2),
        metodo: pago.metodo,
      });
    } catch (err) {
      this.logger.warn(
        `Falló envío de email pago exitoso (pago=${event.idPago}): ${(err as Error).message}`,
      );
    }
  }

  @OnEvent(ReservaCanceladaEvent.NAME)
  async onReservaCancelada(event: ReservaCanceladaEvent): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.log(
        `EMAIL_TRIGGERS_ENABLED=false — skip email reserva cancelada (reserva=${event.idReserva})`,
      );
      return;
    }

    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(event.idReserva) },
      include: {
        usuarios: { select: { nombre: true, email: true } },
        funciones: {
          include: {
            peliculas: { select: { titulo: true } },
            salas: { include: { cines: { select: { nombre: true } } } },
          },
        },
        reservaAsientos: {
          include: {
            asientosfuncion: {
              include: { asientos: { select: { codigo: true, tipo: true } } },
            },
          },
        },
      },
    });

    if (!reserva) {
      this.logger.warn(
        `Reserva ${event.idReserva} no encontrada para email cancelación`,
      );
      return;
    }

    const reembolso = event.idReembolso
      ? await this.prisma.reembolsos.findUnique({
          where: { id: BigInt(event.idReembolso) },
          include: { pagos: { select: { monto_final: true } } },
        })
      : null;

    const funcion = reserva.funciones;
    const fechaFuncion = new Intl.DateTimeFormat('es', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'America/Tegucigalpa',
    }).format(funcion.fecha_hora);

    try {
      await this.mail.sendCancelacionEmail({
        nombre: reserva.usuarios.nombre,
        email: reserva.usuarios.email,
        numeroReserva: reserva.numero_reserva,
        pelicula: funcion.peliculas.titulo,
        cine: `${funcion.salas.cines.nombre} — Sala ${funcion.salas.nombre}`,
        fechaFuncion,
        asientos: reserva.reservaAsientos.map((ra) => ({
          codigo: ra.asientosfuncion.asientos.codigo,
          tipo: ra.asientosfuncion.asientos.tipo,
        })),
        montoPagado: reembolso
          ? reembolso.pagos.monto_final.toFixed(2)
          : undefined,
        estadoReembolso: reembolso?.estado ?? 'sin_reembolso',
        montoReembolso: reembolso ? reembolso.monto.toFixed(2) : undefined,
      });
    } catch (err) {
      this.logger.warn(
        `Falló envío de email cancelación (reserva=${event.idReserva}): ${(err as Error).message}`,
      );
    }
  }

  private isEnabled(): boolean {
    return process.env.EMAIL_TRIGGERS_ENABLED !== 'false';
  }
}
