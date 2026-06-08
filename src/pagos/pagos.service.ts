import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { CreatePagoEfectivoDto } from './dto/create-pago-efectivo.dto';

@Injectable()
export class PagosService {
  constructor(private readonly prisma: PrismaService) {}

  // POST /pagos — pago realizado (tarjeta u otro método digital)
  async create(dto: CreatePagoDto) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(dto.id_reserva) },
    });

    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    if (reserva.estado === 'pagada')
      throw new BadRequestException('La reserva ya fue pagada');
    if (reserva.estado === 'cancelada')
      throw new BadRequestException('La reserva está cancelada');

    const [pago] = await this.prisma.$transaction([
      this.prisma.pagos.create({
        data: {
          id_reserva: BigInt(dto.id_reserva),
          monto_original: dto.monto_original,
          monto_descuento: dto.monto_descuento,
          monto_final: dto.monto_final,
          metodo: dto.metodo,
          estado: 'completado',
        },
      }),
      this.prisma.reservas.update({
        where: { id: BigInt(dto.id_reserva) },
        data: { estado: 'pagada' },
      }),
    ]);

    return pago;
  }

  // POST /pagos/efectivo — exclusivo para recepcionista
  async pagoEfectivo(dto: CreatePagoEfectivoDto) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(dto.id_reserva) },
      include: { reservaAsientos: true },
    });

    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    if (reserva.estado === 'pagada')
      throw new BadRequestException('La reserva ya fue pagada');
    if (reserva.estado === 'cancelada')
      throw new BadRequestException('La reserva está cancelada');

    const [pago] = await this.prisma.$transaction([
      this.prisma.pagos.create({
        data: {
          id_reserva: BigInt(dto.id_reserva),
          monto_original: '0.00', // el recepcionista ingresa el monto en caja
          monto_descuento: '0.00',
          monto_final: '0.00',
          metodo: 'efectivo',
          estado: 'completado',
        },
      }),
      this.prisma.reservas.update({
        where: { id: BigInt(dto.id_reserva) },
        data: { estado: 'pagada' },
      }),
    ]);

    return pago;
  }

  async findOne(id: number) {
    const pago = await this.prisma.pagos.findUnique({
      where: { id: BigInt(id) },
      include: { reservas: true },
    });

    if (!pago) throw new NotFoundException(`Pago #${id} no encontrado`);
    return pago;
  }
}
