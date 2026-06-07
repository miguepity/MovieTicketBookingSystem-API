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

  // Dispara al emitirse `pago.exitoso` desde PagosService.crear
  @OnEvent(PagoExitosoEvent.NAME)
  async onPagoExitoso(event: PagoExitosoEvent): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.log(
        `EMAIL_TRIGGERS_ENABLED=false — skip email pago exitoso (pago=${event.idPago})`,
      );
      return;
    }

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(event.idUsuario) },
      select: { email: true, nombre: true },
    });
    if (!usuario) {
      this.logger.warn(
        `Usuario ${event.idUsuario} no encontrado para email pago`,
      );
      return;
    }
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(event.idReserva) },
      select: { numero_reserva: true },
    });

    try {
      await this.mail.sendEmail({
        to: { email: usuario.email, name: usuario.nombre },
        subject: `Tu pago fue confirmado — reserva ${reserva?.numero_reserva ?? ''}`,
        htmlContent: `
          <h2>¡Hola, ${usuario.nombre}!</h2>
          <p>Tu pago fue procesado exitosamente.</p>
          <p>Reserva: <strong>${reserva?.numero_reserva ?? event.idReserva}</strong></p>
          <p>Gracias por tu compra.</p>
        `,
      });
    } catch (err) {
      this.logger.warn(
        `Falló envío de email pago exitoso (pago=${event.idPago}): ${(err as Error).message}`,
      );
    }
  }

  // Dispara al emitirse `reserva.cancelada` desde ReservasService.cancelar
  @OnEvent(ReservaCanceladaEvent.NAME)
  async onReservaCancelada(event: ReservaCanceladaEvent): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.log(
        `EMAIL_TRIGGERS_ENABLED=false — skip email reserva cancelada (reserva=${event.idReserva})`,
      );
      return;
    }

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(event.idUsuario) },
      select: { email: true, nombre: true },
    });
    if (!usuario) {
      this.logger.warn(
        `Usuario ${event.idUsuario} no encontrado para email cancelación`,
      );
      return;
    }
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(event.idReserva) },
      select: { numero_reserva: true },
    });

    const reembolsoHtml = event.idReembolso
      ? `<p>Se generó el reembolso <strong>${event.idReembolso}</strong>.</p>`
      : '<p>No corresponde reembolso para esta reserva.</p>';

    try {
      await this.mail.sendEmail({
        to: { email: usuario.email, name: usuario.nombre },
        subject: `Cancelación confirmada — reserva ${reserva?.numero_reserva ?? ''}`,
        htmlContent: `
          <h2>Hola, ${usuario.nombre}</h2>
          <p>Tu reserva <strong>${reserva?.numero_reserva ?? event.idReserva}</strong> fue cancelada.</p>
          ${reembolsoHtml}
        `,
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
