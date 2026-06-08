import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import { EstadoReembolso } from 'src/common/enums/estado-reembolso.enum';
import { EstadoPago } from 'src/common/enums/estado-pago.enum';

@Injectable()
export class ReembolsosService {
  constructor(private readonly prisma: PrismaService) {}

  async calcularMonto(idReserva: bigint): Promise<{
    pagoId: bigint | null;
    monto: number;
    porcentaje: number;
  }> {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: idReserva },
      include: {
        funciones: { select: { fecha_hora: true } },
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
      return { pagoId: null, monto: 0, porcentaje: 0 };
    }

    const horasFaltantes = Math.max(
      0,
      (reserva.funciones.fecha_hora.getTime() - Date.now()) / 3_600_000,
    );

    const politica = await this.prisma.politicaCancelacion.findFirst({
      where: {
        horas_antes_minimo: { lte: horasFaltantes },
        OR: [
          { horas_antes_maximo: null },
          { horas_antes_maximo: { gt: horasFaltantes } },
        ],
      },
      orderBy: { horas_antes_minimo: 'desc' },
    });

    const porcentaje = politica
      ? Number(politica.porcentaje_reembolso.toString())
      : 0;
    const montoFinal = Number(pago.monto_final.toString());
    const monto = Math.round(((montoFinal * porcentaje) / 100) * 100) / 100;

    return { pagoId: pago.id, monto, porcentaje };
  }

  async crearReembolso(
    tx: Prisma.TransactionClient,
    pagoId: bigint,
    monto: number,
  ): Promise<{ id: bigint; estado: EstadoReembolso }> {
    const procesadoYa = monto === 0;
    const reembolso = await tx.reembolsos.create({
      data: {
        id_pago: pagoId,
        monto: new Prisma.Decimal(monto.toFixed(2)),
        estado: procesadoYa
          ? EstadoReembolso.PROCESADO
          : EstadoReembolso.PENDIENTE,
        fecha_procesado: procesadoYa ? new Date() : null,
      },
    });
    return { id: reembolso.id, estado: reembolso.estado as EstadoReembolso };
  }

  async procesarEfectivo(idReembolso: string) {
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
    return {
      id_reembolso: refreshed.id.toString(),
      monto: refreshed.monto.toString(),
      estado: refreshed.estado,
      fecha_procesado: refreshed.fecha_procesado?.toISOString() ?? null,
    };
  }
}
