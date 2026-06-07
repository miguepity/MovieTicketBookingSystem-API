import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoAsiento } from 'src/common/enums/estado-asiento.enum';
import { EstadoReserva } from 'src/common/enums/estado-reserva.enum';
import {
  PRECIO_POR_TIPO_ASIENTO,
  PRECIO_DEFAULT,
} from 'src/common/constants/precios.constants';
import { ReembolsosService } from '../reembolsos/reembolsos.service';
import { ReservaCanceladaEvent } from './events/reserva-cancelada.event';

@Injectable()
export class ReservasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reembolsosService: ReembolsosService,
    private readonly eventEmitter: EventEmitter2,
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
            message:
              'El bloqueo ya no es válido (estado actual: ' + a.estado + ')',
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
      include: { reservaAsientos: { select: { id_asiento_funcion: true } } },
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

    const calculo = await this.reembolsosService.calcularMonto(reserva.id);

    const result = await this.prisma.$transaction(async (tx) => {
      const claim = await tx.reservas.updateMany({
        where: {
          id: reserva.id,
          estado: {
            in: [EstadoReserva.PENDIENTE_PAGO, EstadoReserva.PAGADA],
          },
        },
        data: { estado: EstadoReserva.CANCELADA },
      });
      if (claim.count !== 1) {
        throw new ConflictException({
          code: 'RESERVA_NO_CANCELABLE',
          message: 'La reserva ya fue cancelada o cambió de estado',
        });
      }

      const idsAsientoFuncion = reserva.reservaAsientos.map(
        (ra) => ra.id_asiento_funcion,
      );
      if (idsAsientoFuncion.length > 0) {
        await tx.asientosFuncion.updateMany({
          where: { id: { in: idsAsientoFuncion } },
          data: { estado: EstadoAsiento.DISPONIBLE, id_usuario: null },
        });
      }

      let reembolso: { id: bigint; estado: string } | null = null;
      if (calculo.pagoId !== null) {
        reembolso = await this.reembolsosService.crearReembolso(
          tx,
          calculo.pagoId,
          calculo.monto,
        );
      }

      const refreshed = await tx.reservas.findUniqueOrThrow({
        where: { id: reserva.id },
      });

      return { reserva: refreshed, reembolso };
    });

    this.eventEmitter.emit(
      ReservaCanceladaEvent.NAME,
      new ReservaCanceladaEvent(
        result.reserva.id.toString(),
        result.reserva.id_usuario.toString(),
        result.reembolso?.id.toString() ?? null,
      ),
    );

    return {
      id_reserva: result.reserva.id.toString(),
      estado: result.reserva.estado,
      monto_reembolso: calculo.monto.toFixed(2),
      id_reembolso: result.reembolso?.id.toString() ?? null,
      fecha_cancelacion: result.reserva.updated_at.toISOString(),
    };
  }

  private async generarNumeroUnico(tx: {
    reservas: PrismaService['reservas'];
  }): Promise<string> {
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
    throw new Error(
      'No se pudo generar numero_reserva único después de 3 intentos',
    );
  }
}
