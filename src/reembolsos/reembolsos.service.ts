import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReembolsoDto } from './dto/create-reembolso.dto';
import { CreateReembolsoEfectivoDto } from './dto/create-reembolso-efectivo.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ReembolsosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  private async prepararReembolso(idPago: number) {
    const pago = await this.prisma.pagos.findUnique({
      where: { id: BigInt(idPago) },
      include: {
        reservas: {
          include: {
            funciones: true,
            usuarios: { select: { email: true, nombre: true } },
          },
        },
      },
    });

    if (!pago) {
      throw new NotFoundException(`Pago con id ${idPago} no encontrado`);
    }

    if (pago.estado !== 'completado') {
      throw new BadRequestException(
        `El pago con id ${idPago} no se ha completado y no es elegible para reembolso`,
      );
    }

    const reembolsoPrevio = await this.prisma.reembolsos.findFirst({
      where: { id_pago: BigInt(idPago) },
    });

    if (reembolsoPrevio) {
      throw new BadRequestException(
        `Ya existe un reembolso para el pago con id ${idPago}`,
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

    return { pago, horasAntes, politicaReembolso, montoReembolso };
  }

  async calcularReembolso(dto: CreateReembolsoDto) {
    const { pago, horasAntes, politicaReembolso, montoReembolso } =
      await this.prepararReembolso(dto.id_pago);

    return await this.prisma.$transaction(async (tx) => {
      const reembolso = await tx.reembolsos.create({
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

  async reembolsoEfectivo(dto: CreateReembolsoEfectivoDto) {
    const { pago, horasAntes, politicaReembolso, montoReembolso } =
      await this.prepararReembolso(dto.id_pago);

    if (pago.metodo !== 'efectivo') {
      throw new BadRequestException(
        `Este endpoint solo aplica para pagos en efectivo`,
      );
    }

    const resultado = await this.prisma.$transaction(async (tx) => {
      const reembolso = await tx.reembolsos.create({
        data: {
          id_pago: BigInt(dto.id_pago),
          monto: montoReembolso,
          estado: 'pendiente_efectivo',
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

      return reembolso;
    });

    const emailDestino =
      dto.email_recepcionista ?? process.env.BREVO_SENDER_EMAIL ?? '';

    if (emailDestino) {
      await this.mailService.sendEmail(
        emailDestino,
        'Reembolso en efectivo pendiente - MovieSys',
        `
    <h2>Reembolso en efectivo pendiente</h2>
    <p>Se ha registrado un reembolso en efectivo que requiere procesamiento manual.</p>
    <ul>
      <li><strong>Cliente:</strong> ${pago.reservas.usuarios.nombre}</li>
      <li><strong>Email cliente:</strong> ${pago.reservas.usuarios.email}</li>
      <li><strong>Monto a reembolsar:</strong> L. ${montoReembolso.toFixed(2)}</li>
      <li><strong>Porcentaje aplicado:</strong> ${politicaReembolso.porcentaje_reembolso.toString()}%</li>
      <li><strong>Notas:</strong> ${dto.notas ?? 'Sin notas'}</li>
    </ul>
    <p>Por favor procese el reembolso en efectivo al cliente.</p>
  `,
      );
    }

    return {
      ...resultado,
      id: resultado.id.toString(),
      monto: resultado.monto.toString(),
      horas_antes: Math.floor(horasAntes),
      porcentaje_reembolso: politicaReembolso.porcentaje_reembolso.toString(),
      monto_original: pago.monto_final.toString(),
      notificacion_enviada: !!emailDestino,
    };
  }
}
