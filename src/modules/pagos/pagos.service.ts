import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoAsiento } from 'src/common/enums/estado-asiento.enum';
import { EstadoReserva } from 'src/common/enums/estado-reserva.enum';
import { EstadoPago } from 'src/common/enums/estado-pago.enum';
import { MetodoPago } from 'src/common/enums/metodo-pago.enum';
import { PagoExitosoEvent } from './events/pago-exitoso.event';
import { Prisma } from '../../../generated/prisma/client';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotPago } from '../audit-log/snapshots';

interface ProcesarPagoInput {
  idReserva: string;
  idUsuarioActual: string;
  metodo: MetodoPago;
  referenciaExterna?: string;
  codigoCupon?: string;
}

@Injectable()
export class PagosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly auditLog: AuditLogService,
  ) {}

  async crear(input: ProcesarPagoInput) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(input.idReserva) },
      include: {
        funciones: { select: { salas: { select: { id_cine: true } } } },
        reservaAsientos: {
          include: {
            asientosfuncion: {
              include: {
                asientos: {
                  select: {
                    id_tipo_asiento: true,
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
      throw new NotFoundException({
        code: 'RESERVA_NO_ENCONTRADA',
        message: 'La reserva no existe',
      });
    }

    if (reserva.id_usuario !== BigInt(input.idUsuarioActual)) {
      throw new ForbiddenException({
        code: 'RESERVA_NO_ES_DEL_USUARIO',
        message: 'Esta reserva no te pertenece',
      });
    }

    if ((reserva.estado as EstadoReserva) !== EstadoReserva.PENDIENTE_PAGO) {
      throw new ConflictException({
        code: 'RESERVA_NO_PAGABLE',
        message: `La reserva está en estado ${reserva.estado}`,
      });
    }

    const idCine = reserva.funciones.salas.id_cine;
    const tiposAsientoIds = Array.from(
      new Set(
        reserva.reservaAsientos.map(
          (ra) => ra.asientosfuncion.asientos.id_tipo_asiento,
        ),
      ),
    );
    const precios = await this.prisma.preciosCine.findMany({
      where: { id_cine: idCine, id_tipo_asiento: { in: tiposAsientoIds } },
      select: { id_tipo_asiento: true, precio: true },
    });
    const precioPorTipo = new Map(
      precios.map((p) => [p.id_tipo_asiento, Number(p.precio.toString())]),
    );

    const montoOriginal = reserva.reservaAsientos.reduce((acc, ra) => {
      const asiento = ra.asientosfuncion.asientos;
      const precio = precioPorTipo.get(asiento.id_tipo_asiento);
      if (precio === undefined) {
        throw new ConflictException({
          code: 'PRECIO_NO_CONFIGURADO',
          message: `El cine no tiene precio configurado para el tipo "${asiento.tipoAsiento.nombre}"`,
        });
      }
      return acc + precio;
    }, 0);

    const cupon = input.codigoCupon
      ? await this.validarYAplicarCupon(input.codigoCupon, montoOriginal)
      : { id: null as bigint | null, descuento: 0 };

    const montoFinal = Math.max(0, montoOriginal - cupon.descuento);

    const idsAsientoFuncion = reserva.reservaAsientos.map(
      (ra) => ra.asientosfuncion.id,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      const claim = await tx.reservas.updateMany({
        where: { id: reserva.id, estado: EstadoReserva.PENDIENTE_PAGO },
        data: { estado: EstadoReserva.PAGADA },
      });
      if (claim.count !== 1) {
        throw new ConflictException({
          code: 'RESERVA_NO_PAGABLE',
          message: 'La reserva ya fue pagada o cambió de estado',
        });
      }

      const pago = await tx.pagos.create({
        data: {
          id_reserva: reserva.id,
          id_cupon: cupon.id,
          monto_original: new Prisma.Decimal(montoOriginal.toFixed(2)),
          monto_descuento: new Prisma.Decimal(cupon.descuento.toFixed(2)),
          monto_final: new Prisma.Decimal(montoFinal.toFixed(2)),
          metodo: input.metodo,
          estado: EstadoPago.APROBADO,
          referencia_externa: input.referenciaExterna ?? null,
        },
      });

      await tx.asientosFuncion.updateMany({
        where: { id: { in: idsAsientoFuncion } },
        data: { estado: EstadoAsiento.OCUPADO },
      });

      if (cupon.id !== null) {
        await tx.cupones.update({
          where: { id: cupon.id },
          data: { usos_actuales: { increment: 1 } },
        });
      }

      return pago;
    });

    this.eventEmitter.emit(
      PagoExitosoEvent.NAME,
      new PagoExitosoEvent(
        result.id.toString(),
        reserva.id.toString(),
        reserva.id_usuario.toString(),
      ),
    );

    const pagoConReserva = await this.prisma.pagos.findUniqueOrThrow({
      where: { id: result.id },
      include: { reservas: { select: { numero_reserva: true } } },
    });

    await this.auditLog.registrar({
      id_usuario: reserva.id_usuario,
      id_auditor: BigInt(input.idUsuarioActual),
      accion: 'PAGO_APROBAR',
      entidad: 'Pago',
      entidad_id: result.id,
      detalle: `Pago ${result.id.toString()} aprobado para reserva ${reserva.id.toString()}`,
      valor_nuevo: snapshotPago(pagoConReserva),
    });

    return {
      id_pago: result.id.toString(),
      estado: result.estado,
      monto_original: result.monto_original.toString(),
      monto_descuento: result.monto_descuento.toString(),
      monto_final: result.monto_final.toString(),
      numero_reserva: reserva.numero_reserva,
    };
  }

  async crearEfectivo(input: {
    idReserva: string;
    idUsuarioActual: string;
    codigoCupon?: string;
  }) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: BigInt(input.idUsuarioActual) },
      include: { roles: { select: { nombre: true } } },
    });
    if (!usuario || usuario.roles.nombre !== 'admin') {
      throw new ForbiddenException({
        code: 'ROL_NO_AUTORIZADO',
        message: 'Solo el rol admin puede confirmar pagos en efectivo',
      });
    }

    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(input.idReserva) },
      select: { id_usuario: true },
    });
    if (!reserva) {
      throw new NotFoundException({
        code: 'RESERVA_NO_ENCONTRADA',
        message: 'La reserva no existe',
      });
    }

    return this.crear({
      idReserva: input.idReserva,
      idUsuarioActual: reserva.id_usuario.toString(),
      metodo: MetodoPago.EFECTIVO,
      codigoCupon: input.codigoCupon,
    });
  }

  private async validarYAplicarCupon(
    codigo: string,
    montoOriginal: number,
  ): Promise<{ id: bigint; descuento: number }> {
    const cupon = await this.prisma.cupones.findUnique({ where: { codigo } });
    if (!cupon || !cupon.activo || cupon.fecha_expiracion < new Date()) {
      throw new BadRequestException({
        code: 'CUPON_INVALIDO',
        message: 'El cupón no es válido o expiró',
      });
    }
    if (
      cupon.usos_maximos !== null &&
      cupon.usos_actuales >= cupon.usos_maximos
    ) {
      throw new BadRequestException({
        code: 'CUPON_INVALIDO',
        message: 'El cupón ya no tiene usos disponibles',
      });
    }
    const valor = Number(cupon.valor.toString());
    const descuento =
      cupon.tipo === 'porcentaje' ? (montoOriginal * valor) / 100 : valor;
    return { id: cupon.id, descuento };
  }
}
