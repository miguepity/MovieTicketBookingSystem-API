import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';

@Injectable()
export class PagosService {
  constructor(private readonly prisma: PrismaService) {}

  async procesarPago(dto: CreatePagoDto) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(dto.id_reserva) },
      include: {
        reservaAsientos: true,
      },
    });

    if (!reserva) {
      throw new NotFoundException('La reserva no fue encontrada');
    } else if (reserva.estado === 'pagada') {
      throw new BadRequestException('La reserva ya fue pagada');
    } else if (reserva.estado === 'cancelada') {
      throw new BadRequestException('La reserva está cancelada');
    }

    const totalAsientos = reserva.reservaAsientos.length;
    const precioPorAsiento = dto.precio_por_asiento;
    const montoOriginal = totalAsientos * precioPorAsiento;
    let montoDescuento = 0;
    let idCupon: bigint | null = null;

    if (dto.codigo_cupon) {
      const cupon = await this.prisma.cupones.findUnique({
        where: { codigo: dto.codigo_cupon },
      });

      if (!cupon) {
        throw new NotFoundException(
          'Cupon con codigo ${dto.codigo_cupon} no encontrado',
        );
      }

      if (!cupon.activo) {
        throw new BadRequestException('El cupon no está activo');
      }

      if (cupon.fecha_expiracion < new Date()) {
        throw new BadRequestException('El cupon ha expirado');
      }

      if (cupon.usos_maximos && cupon.usos_actuales >= cupon.usos_maximos) {
        throw new BadRequestException(
          'El cupon ha alcanzado el maximo de usos',
        );
      }

      idCupon = cupon.id;

      if (cupon.tipo === 'porcentaje') {
        montoDescuento = montoOriginal * (Number(cupon.valor) / 100);
      } else {
        montoDescuento = Number(cupon.valor);
      }
    }

    const montoFinal = Math.max(0, montoOriginal - montoDescuento);

    return await this.prisma.$transaction(async (tx) => {
      const pago = await tx.pagos.create({
        data: {
          id_reserva: BigInt(dto.id_reserva),
          id_cupon: idCupon,
          monto_original: montoOriginal,
          monto_descuento: montoDescuento,
          monto_final: montoFinal,
          metodo: dto.metodo,
          estado: 'completado',
          referencia_externa: dto.referencia_externa,
        },
        select: {
          id: true,
          monto_original: true,
          monto_descuento: true,
          monto_final: true,
          metodo: true,
          estado: true,
          referencia_externa: true,
          created_at: true,
        },
      });
      await tx.reservas.update({
        where: { id: BigInt(dto.id_reserva) },
        data: { estado: 'pagada' },
      });

      if (idCupon) {
        await tx.cupones.update({
          where: { id: idCupon },
          data: { usos_actuales: { increment: 1 } },
        });
      }

      return {
        ...pago,
        id: pago.id.toString(),
        monto_original: pago.monto_original.toString(),
        monto_descuento: pago.monto_descuento.toString(),
        monto_final: pago.monto_final.toString(),
      };
    });
  }
}
