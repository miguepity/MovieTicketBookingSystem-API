import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreatePagosDto } from './dtos/create-pagos.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PagosService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async procesarPago(createPagoDto: CreatePagosDto) {
    const {
      id_reserva,
      id_cupon,
      monto_original,
      monto_descuento,
      monto_final,
      metodo,
      referencia_externa,
    } = createPagoDto;

    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(id_reserva) },
      include: { reservaAsientos: true },
    });

    if (!reserva) {
      throw new NotFoundException(`La reserva con ID ${id_reserva} no existe.`);
    }

    if (reserva.estado === 'PAGADA') {
      throw new BadRequestException('Esta reserva ya ha sido pagada previamente.');
    }
    if (reserva.estado === 'CANCELADA') {
      throw new BadRequestException('No se puede pagar una reserva que ha sido cancelada.');
    }

    return await this.prisma.$transaction(async (tx) => {
      
      const pago = await tx.pagos.create({
        data: {
          id_reserva: BigInt(id_reserva),
          id_cupon: id_cupon ? BigInt(id_cupon) : null,
          monto_original: new Prisma.Decimal(monto_original),
          monto_descuento: new Prisma.Decimal(monto_descuento),
          monto_final: new Prisma.Decimal(monto_final),
          metodo,
          estado: 'APROBADO',
          referencia_externa,
        },
      });

      const reservaActualizada = await tx.reservas.update({
        where: { id: BigInt(id_reserva) },
        data: { estado: 'PAGADA' },
      });

      const asientosIds = reserva.reservaAsientos.map((ra) => ra.id_asiento_funcion);
      
      if (asientosIds.length > 0) {
        await tx.asientosFuncion.updateMany({
          where: { id: { in: asientosIds } },
          data: { estado: 'OCUPADO' },
        });
      }

      return {
        message: 'Pago procesado y reserva confirmada con éxito.',
        pago,
        reserva: reservaActualizada,
      };
    });
  }
}
