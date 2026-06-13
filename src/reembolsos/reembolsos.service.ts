import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalcularReembolsoDto } from './dto/calcular-reembolso.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReembolsosService {
  constructor(private readonly prisma: PrismaService) {}

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
      throw new BadRequestException(
        `El pago no se puede reembolsar porque su estado actual es: ${pago.estado}`,
      );
    }

    if (pago.reembolsos.length > 0) {
      throw new BadRequestException(
        'Ya existe una solicitud o un proceso de reembolso para este pago.',
      );
    }

    const ahora = new Date();
    const fechaHoraFuncion = new Date(pago.reservas.funciones.fecha_hora);

    const diferenciaMilisegundos = fechaHoraFuncion.getTime() - ahora.getTime();
    const horasAnticipacion = diferenciaMilisegundos / (1000 * 60 * 60);

    if (horasAnticipacion < 0) {
      throw new BadRequestException(
        'No se pueden solicitar reembolsos para funciones que ya han comenzado o finalizado.',
      );
    }

    const politicas = await this.prisma.politicaCancelacion.findMany();

    const politicaAplicable = politicas.find((p) => {
      const cumpleMinimo = horasAnticipacion >= p.horas_antes_minimo;
      const cumpleMaximo =
        p.horas_antes_maximo === null ||
        horasAnticipacion <= p.horas_antes_maximo;
      return cumpleMinimo && cumpleMaximo;
    });

    if (
      !politicaAplicable ||
      Number(politicaAplicable.porcentaje_reembolso) === 0
    ) {
      return {
        id_pago: pago.id,
        horas_anticipacion: parseFloat(horasAnticipacion.toFixed(2)),
        porcentaje_aplicado: 0,
        monto_pago_final: pago.monto_final,
        monto_a_reembolsar: new Prisma.Decimal(0),
        politica_mensaje:
          'No aplica para reembolso por penalización de tiempo insuficiente.',
      };
    }

    const porcentaje = new Prisma.Decimal(
      politicaAplicable.porcentaje_reembolso,
    ).div(100);
    const montoReembolsoCalculado = new Prisma.Decimal(pago.monto_final).mul(
      porcentaje,
    );

    return {
      id_pago: pago.id,
      horas_anticipacion: parseFloat(horasAnticipacion.toFixed(2)),
      porcentaje_aplicado: Number(politicaAplicable.porcentaje_reembolso),
      monto_pago_final: pago.monto_final,
      monto_a_reembolsar: montoReembolsoCalculado,
      politica_mensaje: `Aplica reembolso del ${politicaAplicable.porcentaje_reembolso}% por cancelar con más de ${politicaAplicable.horas_antes_minimo} horas de anticipación.`,
    };
  }

  async create(calcularReembolsoDto: CalcularReembolsoDto) {
    const calculo = await this.calcularReembolso(calcularReembolsoDto);

    const reembolso = await this.prisma.reembolsos.create({
      data: {
        id_pago: calculo.id_pago,
        estado: 'PENDIENTE',
        monto: calculo.monto_a_reembolsar,
        fecha_procesado: new Date(),
      },
    });
    return reembolso;
  }

  async findAll() {
    return this.prisma.reembolsos.findMany();
  }

  async findOne(id: bigint) {
    const reembolso = await this.prisma.reembolsos.findUnique({
      where: { id },
    });

    if (!reembolso) {
      throw new NotFoundException(`Reembolso con ID ${id} no encontrado.`);
    }
    return reembolso;
  }
}
