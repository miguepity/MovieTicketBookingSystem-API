import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { EstadoReserva } from 'src/common/enums/estado-reserva.enum';
import { EstadoAsiento } from 'src/common/enums/estado-asiento.enum';

@Injectable()
export class ReservasExpiracionService {
  private readonly logger = new Logger(ReservasExpiracionService.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async run() {
    if (this.running) return;
    this.running = true;
    try {
      const expiradas = await this.prisma.reservas.findMany({
        where: {
          estado: EstadoReserva.PENDIENTE_PAGO,
          expira_en: { lte: new Date(), not: null },
        },
        include: {
          usuarios: { select: { id: true, email: true, nombre: true } },
          reservaAsientos: { select: { id_asiento_funcion: true } },
          funciones: { include: { peliculas: true, salas: true } },
        },
      });
      for (const r of expiradas) {
        await this.expirarUna(r);
      }
    } finally {
      this.running = false;
    }
  }

  private async expirarUna(r: any) {
    const procesada = await this.prisma.$transaction(async (tx) => {
      const claim = await tx.reservas.updateMany({
        where: {
          id: r.id,
          estado: EstadoReserva.PENDIENTE_PAGO,
          expira_en: { lte: new Date() },
        },
        data: { estado: EstadoReserva.EXPIRADA },
      });
      if (claim.count !== 1) return false;

      const ids = r.reservaAsientos.map((ra: any) => ra.id_asiento_funcion);
      if (ids.length > 0) {
        await tx.asientosFuncion.updateMany({
          where: { id: { in: ids } },
          data: { estado: EstadoAsiento.DISPONIBLE, id_usuario: null },
        });
      }
      return true;
    });

    if (!procesada) return;

    try {
      await this.mail.sendReservaExpiradaEmail({
        to: { email: r.usuarios.email, name: r.usuarios.nombre },
        numeroReserva: r.numero_reserva,
        tituloPelicula: r.funciones.peliculas.titulo,
        nombreSala: r.funciones.salas.nombre,
      });
    } catch (e) {
      this.logger.error(
        `Mail de reserva expirada falló para ${r.numero_reserva}`,
        e as Error,
      );
    }
  }
}
