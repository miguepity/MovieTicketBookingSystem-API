import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  readonly email_pago_exitoso: string = `
    <h1>Pago Confirmado - MovieSys</h1>
    <p><strong>Reserva:</strong> {{numero_reserva}}</p>
    <p><strong>Película:</strong> {{pelicula}}</p>
    <p><strong>Cine:</strong> {{cine}}</p>
    <p><strong>Asientos:</strong> {{asientos}}</p>
    <p><strong>Monto Original:</strong> Q{{monto_original}}</p>
    <p><strong>Descuento:</strong> Q{{descuento}}</p>
    <p><strong>Total Pagado:</strong> Q{{monto_final}}</p>
    <p><strong>Método de Pago:</strong> {{metodo}}</p>
    <p>¡Gracias por tu compra!</p>
  `;

  renderEmailPagoExitoso(data: {
    numero_reserva: string;
    pelicula: string;
    cine: string;
    asientos: string;
    monto_original: string;
    descuento: string;
    monto_final: string;
    metodo: string;
  }): string {
    return this.email_pago_exitoso
      .replace('{{numero_reserva}}', data.numero_reserva)
      .replace('{{pelicula}}', data.pelicula)
      .replace('{{cine}}', data.cine)
      .replace('{{asientos}}', data.asientos)
      .replace('{{monto_original}}', data.monto_original)
      .replace('{{descuento}}', data.descuento)
      .replace('{{monto_final}}', data.monto_final)
      .replace('{{metodo}}', data.metodo);
  }

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

    const result = await this.prisma.$transaction(async (tx) => {
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

    try {
      const full = await this.prisma.reservas.findUnique({
        where: { id: BigInt(dto.id_reserva) },
        include: {
          usuarios: { select: { nombre: true, email: true } },
          funciones: {
            include: {
              peliculas: { select: { titulo: true } },
              salas: { include: { cines: { select: { nombre: true } } } },
            },
          },
          reservaAsientos: {
            include: {
              asientosfuncion: {
                include: { asientos: { select: { codigo: true } } },
              },
            },
          },
        },
      });

      if (full) {
        const asientosStr = full.reservaAsientos
          .map((ra) => ra.asientosfuncion.asientos.codigo)
          .join(', ');

        const html = this.renderEmailPagoExitoso({
          numero_reserva: full.numero_reserva,
          pelicula: full.funciones.peliculas.titulo,
          cine: full.funciones.salas.cines.nombre,
          asientos: asientosStr,
          monto_original: result.monto_original,
          descuento: result.monto_descuento,
          monto_final: result.monto_final,
          metodo: result.metodo,
        });

        await this.mailService.sendEmail(
          full.usuarios.email,
          'Pago Confirmado - MovieSys',
          html,
        );
      }
    } catch (e) {
      this.logger.error(`Error al enviar email de pago: ${e}`);
    }

    return result;
  }
}
