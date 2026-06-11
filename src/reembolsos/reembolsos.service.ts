import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReembolsoDto } from './dto/create-reembolso.dto';

@Injectable()
export class ReembolsosService {
  constructor(private readonly prisma: PrismaService) {}

  async calcularReembolso(dto: CreateReembolsoDto) {
    const pago = await this.prisma.pagos.findUnique({
      where: { id: BigInt(dto.id_pago) },
      include: {
        reservas: {
          include: {
            funciones: true,
          },
        },
      },
    });

    if (!pago) {
      throw new NotFoundException(`Pago con id ${dto.id_pago} no encontrado`);
    }

    if (pago.estado !== 'completado') {
      throw new BadRequestException(
        `El pago con id ${dto.id_pago} no se ha completado y no es elegible para reembolso`,
      );
    }

    const reembolsoPrevio = await this.prisma.reembolsos.findFirst({
      where: { id_pago: BigInt(dto.id_pago) },
    });

    if (reembolsoPrevio) {
      throw new BadRequestException(
        `Ya existe un reembolso para el pago con id ${dto.id_pago}`,
      );
    }

    const ahora = new Date();
    const fechaFuncion = new Date(pago.reservas.funciones.fecha_hora);
    const dif = fechaFuncion.getTime() - ahora.getTime();
    const horasAntes = dif / (1000 * 60 * 60);

    if (horasAntes < 0) {
      const horasTranscurridas = Math.abs(horasAntes).toFixed(2);
      throw new BadRequestException(
        `La función ya ocurrio hace ${horasTranscurridas} horas, no es elegible para reembolso`,
      );
    }

    const politicaReembolso = await this.prisma.politicaCancelacion.findFirst({
      where: {
        horas_antes_minimo: { lte: Math.floor(horasAntes) },
        OR: [
          { horas_antes_maximo: null },
          { horas_antes_maximo: { gte: Math.floor(horasAntes) } },
        ],
      },
      orderBy: { horas_antes_minimo: 'desc' },
    });

    if (!politicaReembolso) {
      throw new BadRequestException(
        `No hay una política de cancelación que cubra la solicitud de reembolso para este pago`,
      );
    }

    const montoReembolso =
      Number(pago.monto_final) *
      (Number(politicaReembolso.porcentaje_reembolso) / 100);

    return await this.prisma.$transaction(async (tx) => {
      const reembolso = await this.prisma.reembolsos.create({
        data: {
          id_pago: BigInt(dto.id_pago),
          monto: montoReembolso,
          estado: 'procesado',
          fecha_procesado: new Date(),
        },
        select: {
          id: true,
          monto: true,
          estado: true,
          fecha_procesado: true,
          created_at: true,
        },
      });

      await tx.pagos.update({
        where: { id: BigInt(dto.id_pago) },
        data: { estado: 'reembolsado' },
      });

      await tx.reservas.update({
        where: { id: pago.reservas.id },
        data: { estado: 'cancelada' },
      });

      return {
        ...reembolso,
        id: reembolso.id.toString(),
        monto: reembolso.monto.toString(),
        horas_antes: Math.floor(horasAntes),
        porcentaje_reembolso: politicaReembolso.porcentaje_reembolso.toString(),
        monto_original: pago.monto_final.toString(),
      };
    });
  }
}
