import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { CreatePagoEfectivoDto } from './dto/create-pago-efectivo.dto';
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
          `Cupon con codigo ${dto.codigo_cupon} no encontrado`,
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

  async procesarPagoEfectivo(dto: CreatePagoEfectivoDto) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(dto.id_reserva) },
      include: { reservaAsientos: true },
    });

    if (!reserva) {
      throw new NotFoundException('La reserva no fue encontrada');
    }

    if (reserva.estado === 'pagada') {
      throw new BadRequestException('La reserva ya fue pagada');
    }

    if (reserva.estado === 'cancelada') {
      throw new BadRequestException('La reserva está cancelada');
    }

    const totalAsientos = reserva.reservaAsientos.length;
    const montoFinal = totalAsientos * dto.precio_por_asiento;

    return await this.prisma.$transaction(async (tx) => {
      const pago = await tx.pagos.create({
        data: {
          id_reserva: BigInt(dto.id_reserva),
          id_cupon: null,
          monto_original: montoFinal,
          monto_descuento: 0,
          monto_final: montoFinal,
          metodo: 'efectivo',
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

      return {
        ...pago,
        id: pago.id.toString(),
        monto_original: pago.monto_original.toString(),
        monto_descuento: pago.monto_descuento.toString(),
        monto_final: pago.monto_final.toString(),
      };
    });
  }

  async getHistorial(filters: {
    estado?: string;
    metodo?: string;
    cliente?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    pagina?: number;
    limite?: number;
  }) {
    if (
      filters.fecha_inicio &&
      isNaN(new Date(filters.fecha_inicio).getTime())
    ) {
      throw new BadRequestException('La fecha de inicio no es válida');
    }

    if (filters.fecha_fin && isNaN(new Date(filters.fecha_fin).getTime())) {
      throw new BadRequestException('La fecha final no es válida');
    }

    if (filters.fecha_inicio && filters.fecha_fin) {
      if (new Date(filters.fecha_inicio) > new Date(filters.fecha_fin)) {
        throw new BadRequestException(
          'La fecha de inicio no puede ser mayor que la fecha final',
        );
      }
    }
    const pagina = Number(filters.pagina ?? 1);
    const limite = Number(filters.limite ?? 10);
    const skip = (pagina - 1) * limite;

    const where: Record<string, unknown> = {};

    if (filters.estado) {
      where.estado = filters.estado;
    }

    if (filters.metodo) {
      where.metodo = filters.metodo;
    }

    if (filters.fecha_inicio || filters.fecha_fin) {
      where.created_at = {
        ...(filters.fecha_inicio && { gte: new Date(filters.fecha_inicio) }),
        ...(filters.fecha_fin && {
          lte: new Date(filters.fecha_fin + 'T23:59:59Z'),
        }),
      };
    }

    if (filters.cliente) {
      where.reservas = {
        usuarios: {
          OR: [
            { nombre: { contains: filters.cliente, mode: 'insensitive' } },
            { email: { contains: filters.cliente, mode: 'insensitive' } },
          ],
        },
      };
    }

    const [total, pagos] = await Promise.all([
      this.prisma.pagos.count({ where }),
      this.prisma.pagos.findMany({
        where,
        skip,
        take: limite,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          monto_original: true,
          monto_descuento: true,
          monto_final: true,
          metodo: true,
          estado: true,
          referencia_externa: true,
          created_at: true,
          reservas: {
            select: {
              id: true,
              numero_reserva: true,
              usuarios: { select: { id: true, nombre: true, email: true } },
            },
          },
          reembolsos: {
            select: {
              id: true,
              monto: true,
              estado: true,
              fecha_procesado: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      pagina,
      limite,
      total_paginas: Math.ceil(total / limite),
      data: pagos.map((p) => ({
        id: p.id.toString(),
        monto_original: p.monto_original.toString(),
        monto_descuento: p.monto_descuento.toString(),
        monto_final: p.monto_final.toString(),
        metodo: p.metodo,
        estado: p.estado,
        referencia_externa: p.referencia_externa,
        created_at: p.created_at,
        reserva: {
          id: p.reservas.id.toString(),
          numero_reserva: p.reservas.numero_reserva,
          usuario: {
            id: p.reservas.usuarios.id.toString(),
            nombre: p.reservas.usuarios.nombre,
            email: p.reservas.usuarios.email,
          },
        },
        reembolso: p.reembolsos[0]
          ? {
              id: p.reembolsos[0].id.toString(),
              monto: p.reembolsos[0].monto.toString(),
              estado: p.reembolsos[0].estado,
              fecha_procesado: p.reembolsos[0].fecha_procesado,
            }
          : null,
      })),
    };
  }
}
