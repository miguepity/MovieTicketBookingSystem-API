import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PagoExitosoEvent } from 'src/modules/pagos/events/pago-exitoso.event';
import { ReservaCanceladaEvent } from 'src/modules/reservas/events/reserva-cancelada.event';
import { FuncionCanceladaEvent } from 'src/modules/funciones/events/funcion-cancelada.event';
import { PeliculaDisponibleEvent } from 'src/modules/suscripciones-estreno/events/pelicula-disponible.event';
import { SuscripcionesEstrenoService } from 'src/modules/suscripciones-estreno/suscripciones-estreno.service';
import { EstadoReserva } from 'src/common/enums/estado-reserva.enum';
import { EstadoPago } from 'src/common/enums/estado-pago.enum';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    private readonly mail: MailService,
    private readonly prisma: PrismaService,
    private readonly suscripciones: SuscripcionesEstrenoService,
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
                    asientos: {
                      select: {
                        codigo: true,
                        tipoAsiento: { select: { nombre: true } },
                      },
                    },
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
          tipo: ra.asientosfuncion.asientos.tipoAsiento.nombre,
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
              include: {
                asientos: {
                  select: {
                    codigo: true,
                    tipoAsiento: { select: { nombre: true } },
                  },
                },
              },
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
          tipo: ra.asientosfuncion.asientos.tipoAsiento.nombre,
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

  @OnEvent(FuncionCanceladaEvent.NAME)
  async onFuncionCancelada(event: FuncionCanceladaEvent): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.log(
        `EMAIL_TRIGGERS_ENABLED=false — skip email función cancelada (funcion=${event.idFuncion})`,
      );
      return;
    }

    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(event.idFuncion) },
      include: {
        peliculas: { select: { titulo: true } },
        salas: { include: { cines: { select: { nombre: true } } } },
        reservas: {
          where: { estado: { not: EstadoReserva.CANCELADA } },
          include: {
            usuarios: { select: { nombre: true, email: true } },
            pagos: { select: { estado: true, monto_final: true } },
          },
        },
      },
    });

    if (!funcion) {
      this.logger.warn(
        `Función ${event.idFuncion} no encontrada para email cancelación`,
      );
      return;
    }

    if (funcion.reservas.length === 0) {
      this.logger.log(
        `Función ${event.idFuncion} cancelada sin reservas activas — no se envían emails`,
      );
      return;
    }

    const fechaFuncion = new Intl.DateTimeFormat('es', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'America/Tegucigalpa',
    }).format(funcion.fecha_hora);

    const cine = `${funcion.salas.cines.nombre} — Sala ${funcion.salas.nombre}`;

    for (const reserva of funcion.reservas) {
      const pagoAprobado = reserva.pagos.find(
        (p) => (p.estado as EstadoPago) === EstadoPago.APROBADO,
      );

      try {
        await this.mail.sendFuncionCanceladaEmail({
          nombre: reserva.usuarios.nombre,
          email: reserva.usuarios.email,
          pelicula: funcion.peliculas.titulo,
          cine,
          fechaFuncion,
          numeroReserva: reserva.numero_reserva,
          tienePagoAprobado: !!pagoAprobado,
          montoPagado: pagoAprobado?.monto_final.toFixed(2),
        });
      } catch (err) {
        this.logger.warn(
          `Falló envío de email función cancelada (reserva=${reserva.id.toString()}): ${(err as Error).message}`,
        );
      }
    }
  }

  @OnEvent(PeliculaDisponibleEvent.NAME)
  async onPeliculaDisponible(event: PeliculaDisponibleEvent): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.log(
        `EMAIL_TRIGGERS_ENABLED=false — skip avisos de estreno (pelicula=${event.idPelicula})`,
      );
      return;
    }

    const pelicula = await this.prisma.peliculas.findUnique({
      where: { id: event.idPelicula },
      select: {
        id: true,
        titulo: true,
        poster_url: true,
        fecha_estreno: true,
        generos: { select: { nombre: true } },
      },
    });
    if (!pelicula) {
      this.logger.warn(`Pelicula ${event.idPelicula} no encontrada para avisos`);
      return;
    }

    const pendientes = await this.suscripciones.listarNoNotificadosDePelicula(event.idPelicula);
    if (pendientes.length === 0) return;

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const link = `${frontendUrl}/peliculas/${pelicula.id.toString()}`;
    const fechaEstreno = pelicula.fecha_estreno
      ? new Intl.DateTimeFormat('es', { dateStyle: 'long' }).format(pelicula.fecha_estreno)
      : 'Disponible ahora';
    const genero = pelicula.generos?.nombre ?? 'Sin clasificar';

    const enviados: bigint[] = [];
    const BATCH = 25;
    for (let i = 0; i < pendientes.length; i += BATCH) {
      const slice = pendientes.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        slice.map((p) =>
          this.mail.sendNuevaPeliculaEmail({
            nombre: p.nombre,
            email: p.email,
            titulo: pelicula.titulo,
            genero,
            fechaEstreno,
            posterUrl: pelicula.poster_url ?? undefined,
            link,
          }),
        ),
      );
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') enviados.push(slice[idx].suscripcionId);
      });
    }

    await this.suscripciones.marcarNotificados(enviados);
    this.logger.log(
      `Avisos de estreno enviados: ${enviados.length}/${pendientes.length} para "${pelicula.titulo}"`,
    );
  }

  private isEnabled(): boolean {
    return process.env.EMAIL_TRIGGERS_ENABLED !== 'false';
  }
}
