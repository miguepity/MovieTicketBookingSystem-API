import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalcularReembolsoDto } from './dto/calcular-reembolso.dto';
import { RegistrarReembolsoEfectivoDto } from './dto/registrar-reembolso-efectivo.dto';
import { Prisma } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { buildCashRefundNotificationTemplate } from '../mail/templates/cash-refund-notification.template';

@Injectable()
export class ReembolsosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async calcularReembolso(calcularReembolsoDto: CalcularReembolsoDto) {
    const { id_pago } = calcularReembolsoDto;
    const pagoIdBigInt = BigInt(id_pago);

    const pago = await this.prisma.pagos.findUnique({
      where: { id: pagoIdBigInt },
      include: {
        reservas: {
          include: {
            funciones: true,
          },
        },
        reembolsos: true,
      },
    });

    if (!pago) {
      throw new NotFoundException(`El pago con ID ${id_pago} no existe.`);
    }

    if (pago.estado !== 'APROBADO') {
      throw new BadRequestException(`El pago no se puede reembolsar porque su estado actual es: ${pago.estado}`);
    }

    if (pago.reembolsos.length > 0) {
      throw new BadRequestException('Ya existe una solicitud o un proceso de reembolso para este pago.');
    }

    const ahora = new Date();
    const fechaHoraFuncion = new Date(pago.reservas.funciones.fecha_hora);
    
    const diferenciaMilisegundos = fechaHoraFuncion.getTime() - ahora.getTime();
    const horasAnticipacion = diferenciaMilisegundos / (1000 * 60 * 60);

    if (horasAnticipacion < 0) {
      throw new BadRequestException('No se pueden solicitar reembolsos para funciones que ya han comenzado o finalizado.');
    }

    const politicas = await this.prisma.politicaCancelacion.findMany();
    
    const politicaAplicable = politicas.find((p) => {
      const cumpleMinimo = horasAnticipacion >= p.horas_antes_minimo;
      const cumpleMaximo = p.horas_antes_maximo === null || horasAnticipacion <= p.horas_antes_maximo;
      return cumpleMinimo && cumpleMaximo;
    });

    if (!politicaAplicable || Number(politicaAplicable.porcentaje_reembolso) === 0) {
      return {
        id_pago: pago.id,
        horas_anticipacion: parseFloat(horasAnticipacion.toFixed(2)),
        porcentaje_aplicado: 0,
        monto_pago_final: pago.monto_final,
        monto_a_reembolsar: new Prisma.Decimal(0),
        politica_mensaje: 'No aplica para reembolso por penalización de tiempo insuficiente.',
      };
    }

    const porcentaje = new Prisma.Decimal(politicaAplicable.porcentaje_reembolso).div(100);
    const montoReembolsoCalculado = new Prisma.Decimal(pago.monto_final).mul(porcentaje);

    return {
      id_pago: pago.id,
      horas_anticipacion: parseFloat(horasAnticipacion.toFixed(2)),
      porcentaje_aplicado: Number(politicaAplicable.porcentaje_reembolso),
      monto_pago_final: pago.monto_final,
      monto_a_reembolsar: montoReembolsoCalculado,
      politica_mensaje: `Aplica reembolso del ${politicaAplicable.porcentaje_reembolso}% por cancelar con más de ${politicaAplicable.horas_antes_minimo} horas de anticipación.`,
    };
  }

  async registrarReembolsoEfectivo(dto: RegistrarReembolsoEfectivoDto) {
    const pago = await this.prisma.pagos.findUnique({
      where: { id: BigInt(dto.id_pago) },
      include: {
        reservas: {
          include: {
            usuarios: true,
          },
        },
        reembolsos: true,
      },
    });

    if (!pago) {
      throw new NotFoundException(`El pago con ID ${dto.id_pago} no existe.`);
    }

    if (pago.estado !== 'APROBADO') {
      throw new BadRequestException(`El pago no se puede reembolsar porque su estado actual es: ${pago.estado}`);
    }

    if (pago.reembolsos.length > 0) {
      throw new BadRequestException('Ya existe una solicitud o un proceso de reembolso para este pago.');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const reembolso = await tx.reembolsos.create({
        data: {
          id_pago: pago.id,
          monto: new Prisma.Decimal(dto.monto),
          estado: 'PROCESADO_EFECTIVO',
          fecha_procesado: new Date(),
        },
      });

      const pagoActualizado = await tx.pagos.update({
        where: { id: pago.id },
        data: { estado: 'REEMBOLSADO' },
      });

      return { reembolso, pago: pagoActualizado };
    });

    const notificacion_enviada = await this.notifyCashRefund(pago, dto);

    return {
      message: 'Reembolso en efectivo registrado exitosamente.',
      reembolso: result.reembolso,
      pago: result.pago,
      notificacion_enviada,
    };
  }

  private async notifyCashRefund(pago: any, dto: RegistrarReembolsoEfectivoDto) {
    const recipient = process.env.REFUND_RECEPTIONIST_EMAIL ?? process.env.MAIL_TEST_TO;

    if (!recipient) {
      return false;
    }

    try {
      await this.mailService.sendEmail({
        to: recipient,
        subject: 'Reembolso en efectivo registrado',
        html: buildCashRefundNotificationTemplate({
          paymentId: Number(pago.id),
          reservationNumber: pago.reservas.numero_reserva,
          customerName: pago.reservas.usuarios.nombre,
          customerEmail: pago.reservas.usuarios.email,
          amount: dto.monto,
          note: dto.nota,
        }),
      });

      return true;
    } catch (error) {
      console.error('No se pudo notificar el reembolso en efectivo.', error);
      return false;
    }
  }
}
