import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/modules/mail/mail.service';
import { EstadoAsiento } from 'src/common/enums/estado-asiento.enum';
import { EstadoReserva } from 'src/common/enums/estado-reserva.enum';
import { EstadoPago } from 'src/common/enums/estado-pago.enum';
import {
  PRECIO_POR_TIPO_ASIENTO,
  PRECIO_DEFAULT,
} from 'src/common/constants/precios.constants';

@Injectable()
export class ReservasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async crear(
    idFuncion: string,
    idsAsientoFuncion: string[],
    idUsuarioActual: string,
  ) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(idFuncion) },
      select: { id: true },
    });
    if (!funcion) {
      throw new NotFoundException({
        code: 'FUNCION_NO_ENCONTRADA',
        message: 'La función no existe',
      });
    }

    const idsBig = idsAsientoFuncion.map((s) => BigInt(s));
    const idUserBig = BigInt(idUsuarioActual);

    return this.prisma.$transaction(async (tx) => {
      const asientos = await tx.asientosFuncion.findMany({
        where: { id: { in: idsBig }, id_funcion: funcion.id },
        include: { asientos: { select: { tipo: true, codigo: true } } },
      });

      if (asientos.length !== idsBig.length) {
        throw new NotFoundException({
          code: 'ASIENTO_INVALIDO',
          message: 'Algún asiento no pertenece a la función',
        });
      }

      const ahora = new Date();
      for (const a of asientos) {
        if ((a.estado as EstadoAsiento) !== EstadoAsiento.BLOQUEADO) {
          throw new ConflictException({
            code: 'BLOQUEO_EXPIRADO',
            message: 'El bloqueo ya no es válido (estado actual: ' + a.estado + ')',
          });
        }
        if (a.id_usuario !== idUserBig) {
          throw new ForbiddenException({
            code: 'BLOQUEO_NO_ES_DEL_USUARIO',
            message: 'No podés reservar bloqueos de otro usuario',
          });
        }
        if (a.bloqueado_hasta <= ahora) {
          throw new ConflictException({
            code: 'BLOQUEO_EXPIRADO',
            message: 'El bloqueo expiró',
          });
        }
      }

      const totalEstimado = asientos.reduce(
        (acc, a) =>
          acc + (PRECIO_POR_TIPO_ASIENTO[a.asientos.tipo] ?? PRECIO_DEFAULT),
        0,
      );

      const numeroReserva = await this.generarNumeroUnico(tx);

      const reserva = await tx.reservas.create({
        data: {
          numero_reserva: numeroReserva,
          id_usuario: idUserBig,
          id_funcion: funcion.id,
          estado: EstadoReserva.PENDIENTE_PAGO,
        },
      });

      await tx.reservaAsientos.createMany({
        data: idsBig.map((id) => ({
          id_reserva: reserva.id,
          id_asiento_funcion: id,
        })),
      });

      await tx.asientosFuncion.updateMany({
        where: { id: { in: idsBig } },
        data: { estado: EstadoAsiento.RESERVADO },
      });

      return {
        id_reserva: reserva.id.toString(),
        numero_reserva: reserva.numero_reserva,
        estado: reserva.estado,
        asientos: asientos.map((a) => ({
          codigo: a.asientos.codigo,
          tipo: a.asientos.tipo,
        })),
        total_estimado: totalEstimado.toFixed(2),
      };
    });
  }

  async cancelar(idReserva: string, idUsuarioActual: string) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(idReserva) },
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
        pagos: {
          where: { estado: EstadoPago.APROBADO },
          orderBy: { created_at: 'desc' },
          take: 1,
          include: { reembolsos: { orderBy: { created_at: 'desc' }, take: 1 } },
        },
      },
    });

    if (!reserva) {
      throw new NotFoundException({
        code: 'RESERVA_NO_ENCONTRADA',
        message: 'La reserva no existe',
      });
    }

    if (reserva.id_usuario !== BigInt(idUsuarioActual)) {
      throw new ForbiddenException({
        code: 'RESERVA_NO_ES_DEL_USUARIO',
        message: 'Esta reserva no te pertenece',
      });
    }

    const estado = reserva.estado as EstadoReserva;
    if (
      estado !== EstadoReserva.PENDIENTE_PAGO &&
      estado !== EstadoReserva.PAGADA
    ) {
      throw new ConflictException({
        code: 'RESERVA_NO_CANCELABLE',
        message: `La reserva está en estado ${reserva.estado} y no puede cancelarse`,
      });
    }

    const idsAsientoFuncion = reserva.reservaAsientos.map(
      (ra) => ra.asientosfuncion.id,
    );

    const pago = reserva.pagos[0] ?? null;

    await this.prisma.$transaction(async (tx) => {
      await tx.reservas.update({
        where: { id: reserva.id },
        data: { estado: EstadoReserva.CANCELADA },
      });

      await tx.asientosFuncion.updateMany({
        where: { id: { in: idsAsientoFuncion } },
        data: { estado: EstadoAsiento.DISPONIBLE, id_usuario: null },
      });

      if (pago) {
        await tx.reembolsos.create({
          data: {
            id_pago: pago.id,
            monto: pago.monto_final,
            estado: 'pendiente',
          },
        });
      }
    });

    const reembolso = pago
      ? await this.prisma.reembolsos.findFirst({
          where: { id_pago: pago.id },
          orderBy: { created_at: 'desc' },
        })
      : null;

    const funcion = reserva.funciones;
    const fechaFuncion = new Intl.DateTimeFormat('es', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'America/Tegucigalpa',
    }).format(funcion.fecha_hora);

    await this.mailService.sendCancelacionEmail({
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
      montoPagado: pago ? pago.monto_final.toFixed(2) : undefined,
      estadoReembolso: reembolso?.estado ?? 'sin_reembolso',
      montoReembolso: reembolso ? reembolso.monto.toFixed(2) : undefined,
    });

    return { mensaje: 'Reserva cancelada exitosamente' };
  }

  private async generarNumeroUnico(
    tx: { reservas: PrismaService['reservas'] },
  ): Promise<string> {
    const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    for (let i = 0; i < 3; i++) {
      const sufijo = Math.random().toString(36).slice(2, 7).toUpperCase();
      const candidato = `RES-${fecha}-${sufijo}`;
      const existente = await tx.reservas.findUnique({
        where: { numero_reserva: candidato },
        select: { id: true },
      });
      if (!existente) return candidato;
    }
    throw new Error('No se pudo generar numero_reserva único después de 3 intentos');
  }
}
