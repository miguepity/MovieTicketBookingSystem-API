import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { CreatePagoEfectivoDto } from './dto/create-pago-efectivo.dto';
import { EmailService } from '../email/email.service';
@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // POST /pagos — pago realizado (tarjeta u otro método digital)
  async create(dto: CreatePagoDto) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(dto.id_reserva) },
      include: {
        usuarios: { select: { nombre: true, email: true } },
        funciones: {
          include: { peliculas: { select: { titulo: true } } },
        },
      },
    });

    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    if (reserva.estado === 'pagada')
      throw new BadRequestException('La reserva ya fue pagada');
    if (reserva.estado === 'cancelada')
      throw new BadRequestException('La reserva está cancelada');

    const idCupon = await this.validarCuponParaPago(dto.id_cupon);

    const [pago] = await this.prisma.$transaction([
      this.prisma.pagos.create({
        data: {
          id_reserva: BigInt(dto.id_reserva),
          id_cupon: idCupon,
          monto_original: dto.monto_original,
          monto_descuento: dto.monto_descuento,
          monto_final: dto.monto_final,
          metodo: dto.metodo,
          estado: 'Completado',
        },
      }),
      this.prisma.reservas.update({
        where: { id: BigInt(dto.id_reserva) },
        data: { estado: 'pagada' },
      }),
      ...(idCupon
        ? [
            this.prisma.cupones.update({
              where: { id: idCupon },
              data: { usos_actuales: { increment: 1 } },
            }),
          ]
        : []),
    ]);

    // Trigger email — Promise sin await para no bloquear la respuesta
    this.emailService
      .sendPagoExitoso(
        reserva.usuarios.email,
        reserva.usuarios.nombre,
        reserva.numero_reserva,
        reserva.funciones.peliculas.titulo,
        reserva.funciones.fecha_hora,
        dto.monto_final,
      )
      .catch((err: unknown) => {
        this.logger.error(
          'Error enviando email de pago exitoso',
          err instanceof Error ? err.message : String(err),
        );
      });

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

    const idCupon = await this.validarCuponParaPago(dto.id_cupon);

    const [pago] = await this.prisma.$transaction([
      this.prisma.pagos.create({
        data: {
          id_reserva: BigInt(dto.id_reserva),
          id_cupon: idCupon,
          monto_original: dto.monto_original,
          monto_descuento: dto.monto_descuento,
          monto_final: dto.monto_final,
          metodo: 'efectivo',
          estado: 'Completado',
        },
      }),
      this.prisma.reservas.update({
        where: { id: BigInt(dto.id_reserva) },
        data: { estado: 'Confirmada' },
      }),
      ...(idCupon
        ? [
            this.prisma.cupones.update({
              where: { id: idCupon },
              data: { usos_actuales: { increment: 1 } },
            }),
          ]
        : []),
    ]);

    return pago;
  }

  // Re-valida el cupón al momento del pago (no solo al momento de aplicarlo
  // en el carrito) para no incrementar usos_actuales sobre un cupón que ya
  // expiró/se agotó entre que el cliente lo aplicó y confirmó el pago.
  private async validarCuponParaPago(
    idCupon: number | undefined,
  ): Promise<bigint | null> {
    if (idCupon === undefined) return null;

    const cupon = await this.prisma.cupones.findUnique({
      where: { id: BigInt(idCupon) },
    });
    if (!cupon) throw new NotFoundException('El cupón no existe');
    if (!cupon.activo) throw new BadRequestException('El cupón está inactivo');
    if (cupon.fecha_expiracion < new Date())
      throw new BadRequestException('El cupón ha expirado');
    if (
      cupon.usos_maximos !== null &&
      cupon.usos_actuales >= cupon.usos_maximos
    ) {
      throw new BadRequestException('El cupón ha alcanzado su límite de usos');
    }

    return cupon.id;
  }

  async findAll() {
    return await this.prisma.pagos.findMany({
      include: {
        reservas: {
          select: {
            usuarios: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const pago = await this.prisma.pagos.findUnique({
      where: { id: BigInt(id) },
      include: { reservas: true },
    });

    if (!pago) throw new NotFoundException(`Pago #${id} no encontrado`);
    return pago;
  }

  async cambiarEstadorPago(id: number, estado: string) {
    const pago = await this.prisma.pagos.findUnique({
      where: { id: BigInt(id) },
    });

    if (!pago) throw new NotFoundException(`Pago #${id} no encontrado`);

    await this.prisma.pagos.update({
      where: { id: BigInt(id) },
      data: { estado },
    });
    return { message: 'Pago actualizado con exito.' };
  }
}
