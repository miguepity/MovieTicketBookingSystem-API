import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import { EstadoReembolso } from '../../common/enums/estado-reembolso.enum';
import { EstadoPago } from '../../common/enums/estado-pago.enum';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotReembolso } from '../audit-log/snapshots';

@Injectable()
export class ReembolsosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async calcularMonto(idReserva: bigint): Promise<{
    pagoId: bigint | null;
    monto: number;
    porcentaje: number;
    politicaId: bigint | null;
  }> {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: idReserva },
      include: {
        funciones: {
          select: {
            fecha_hora: true,
            salas: { select: { id_cine: true } },
          },
        },
        pagos: {
          where: { estado: EstadoPago.APROBADO },
          orderBy: { id: 'desc' },
          take: 1,
        },
      },
    });
    if (!reserva) {
      throw new NotFoundException({
        code: 'RESERVA_NO_ENCONTRADA',
        message: 'La reserva no existe',
      });
    }
    const pago = reserva.pagos[0];
    if (!pago) {
      return { pagoId: null, monto: 0, porcentaje: 0, politicaId: null };
    }

    const horasFaltantes = Math.max(
      0,
      (reserva.funciones.fecha_hora.getTime() - Date.now()) / 3_600_000,
    );

    const idCine = reserva.funciones.salas.id_cine;
    const politica = await this.prisma.politicaCancelacion.findFirst({
      where: { id_cine: idCine, activa: true },
      include: {
        reglas: {
          where: {
            horas_antes_minimo: { lte: horasFaltantes },
            OR: [
              { horas_antes_maximo: null },
              { horas_antes_maximo: { gt: horasFaltantes } },
            ],
          },
          orderBy: { horas_antes_minimo: 'desc' },
          take: 1,
        },
      },
    });

    if (!politica || politica.reglas.length === 0) {
      return {
        pagoId: pago.id,
        monto: 0,
        porcentaje: 0,
        politicaId: politica?.id ?? null,
      };
    }

    const regla = politica.reglas[0];
    const porcentaje = Number(regla.porcentaje_reembolso.toString());
    const montoFinal = Number(pago.monto_final.toString());
    const monto = Math.round(((montoFinal * porcentaje) / 100) * 100) / 100;

    return { pagoId: pago.id, monto, porcentaje, politicaId: politica.id };
  }

  async crearReembolso(
    tx: Prisma.TransactionClient,
    pagoId: bigint,
    monto: number,
    porcentaje: number,
    politicaId: bigint | null,
  ): Promise<{ id: bigint; estado: EstadoReembolso }> {
    const procesadoYa = monto === 0;
    const reembolso = await tx.reembolsos.create({
      data: {
        id_pago: pagoId,
        id_politica: politicaId,
        porcentaje_aplicado: new Prisma.Decimal(porcentaje.toFixed(2)),
        monto: new Prisma.Decimal(monto.toFixed(2)),
        estado: procesadoYa
          ? EstadoReembolso.PROCESADO
          : EstadoReembolso.PENDIENTE,
        fecha_procesado: procesadoYa ? new Date() : null,
      },
    });
    return { id: reembolso.id, estado: reembolso.estado as EstadoReembolso };
  }

  async procesarEfectivo(idReembolso: string, auditorId: bigint) {
    const reembolso = await this.prisma.reembolsos.findUnique({
      where: { id: BigInt(idReembolso) },
    });
    if (!reembolso) {
      throw new NotFoundException({
        code: 'REEMBOLSO_NO_ENCONTRADO',
        message: 'El reembolso no existe',
      });
    }

    const claim = await this.prisma.reembolsos.updateMany({
      where: { id: reembolso.id, estado: EstadoReembolso.PENDIENTE },
      data: {
        estado: EstadoReembolso.PROCESADO,
        fecha_procesado: new Date(),
      },
    });
    if (claim.count !== 1) {
      throw new ConflictException({
        code: 'REEMBOLSO_NO_PROCESABLE',
        message: `El reembolso está en estado ${reembolso.estado}`,
      });
    }

    const refreshed = await this.prisma.reembolsos.findUniqueOrThrow({
      where: { id: reembolso.id },
    });
    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'REEMBOLSO_PROCESAR',
      entidad: 'Reembolso',
      entidad_id: reembolso.id,
      detalle: `Reembolso ${idReembolso} procesado en efectivo`,
      valor_anterior: snapshotReembolso(reembolso),
      valor_nuevo: snapshotReembolso(refreshed),
    });
    return {
      id_reembolso: refreshed.id.toString(),
      monto: refreshed.monto.toString(),
      estado: refreshed.estado,
      fecha_procesado: refreshed.fecha_procesado?.toISOString() ?? null,
    };
  }
}
