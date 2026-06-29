import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReservasBodyDto } from './dto/reservas.body.dto';
import { ReservasFilterDto } from './dto/reservas.filter.dto';
import { ReembolsosService } from '../reembolsos/reembolsos.services';

@Injectable()
export class ReservasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reembolsosService: ReembolsosService,
  ) {}

  async createReserva(dto: ReservasBodyDto) {
    const findUsuario = await this.prisma.usuarios.findFirst({
      where: { id: dto.id_usuario },
    });
    if (!findUsuario) {
      throw new NotFoundException('Usuario no existe');
    }

    const findFuncion = await this.prisma.funciones.findFirst({
      where: { id: dto.id_funcion },
    });
    if (!findFuncion) {
      throw new NotFoundException('Funcion no existe');
    }

    return this.prisma.$transaction(async (tx) => {
      // Accept seats that are free OR blocked by this same user
      const asientos = await tx.asientosFuncion.findMany({
        where: {
          id: { in: dto.id_asientos.map(BigInt) },
          id_funcion: dto.id_funcion,
          OR: [
            { estado: 'disponible' },
            { estado: 'bloqueado', id_usuario: BigInt(dto.id_usuario) },
          ],
        },
      });
      if (asientos.length !== dto.id_asientos.length) {
        throw new BadRequestException(
          'Uno o más asientos no están disponibles',
        );
      }

      const count = await tx.reservas.count();
      const numero_reserva = `RES-${String(count + 1).padStart(6, '0')}`;

      const newReserva = await tx.reservas.create({
        data: {
          numero_reserva,
          id_usuario: dto.id_usuario,
          id_funcion: dto.id_funcion,
          estado: 'activa',
        },
      });

      await tx.reservaAsientos.createMany({
        data: dto.id_asientos.map((id_asiento_funcion) => ({
          id_reserva: newReserva.id,
          id_asiento_funcion: BigInt(id_asiento_funcion),
        })),
      });

      // Re-afirmar atómicamente la misma condición validada arriba: si otra
      // solicitud concurrente tomó alguno de estos asientos entre la lectura
      // y esta escritura, count será menor al esperado y se revierte todo.
      const resultado = await tx.asientosFuncion.updateMany({
        where: {
          id: { in: dto.id_asientos.map(BigInt) },
          id_funcion: dto.id_funcion,
          OR: [
            { estado: 'disponible' },
            { estado: 'bloqueado', id_usuario: BigInt(dto.id_usuario) },
          ],
        },
        data: {
          estado: 'reservado',
          id_usuario: BigInt(dto.id_usuario),
          version: { increment: 1 },
        },
      });

      if (resultado.count !== dto.id_asientos.length) {
        throw new ConflictException(
          'Uno o más asientos no están disponibles',
        );
      }

      return newReserva;
    });
  }

  async getReservaById(id: number) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(id) },
      include: {
        usuarios: { select: { nombre: true, email: true } },
        funciones: {
          include: { peliculas: { select: { titulo: true } } },
        },
        reservaAsientos: {
          include: { asientosfuncion: { include: { asientos: true } } },
        },
        pagos: true,
      },
    });
    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }
    return reserva;
  }

  async cancelarReserva(id: number) {
    const findReserva = await this.prisma.reservas.findFirst({
      where: { id: BigInt(id) },
    });
    if (!findReserva) {
      throw new NotFoundException('Reserva no existe');
    }
    if (findReserva.estado.toLowerCase() === 'cancelada') {
      throw new BadRequestException('La reserva ya está cancelada');
    }

    // Solo las reservas pagadas generan un reembolso; una reserva que
    // todavía no se pagó simplemente se cancela y libera sus asientos.
    const findPago = await this.prisma.pagos.findFirst({
      where: { id_reserva: BigInt(id), estado: 'Completado' },
    });

    let reembolsoInfo: { porcentaje: number; monto: number } | null = null;

    if (findPago) {
      const calculo = await this.reembolsosService.calcularReembolso(id);
      const monto = calculo.monto_de_reembolso;
      const porcentaje = Number(calculo.porcentaje_de_reembolso);

      await this.prisma.pagos.update({
        where: { id: findPago.id },
        data: { estado: 'Reembolsado' },
      });

      await this.prisma.reembolsos.create({
        data: {
          id_pago: BigInt(findPago.id),
          monto,
          estado: 'Pendiente',
          fecha_procesado: null,
        },
      });

      reembolsoInfo = { porcentaje, monto };
    }

    const asientosReservados = await this.prisma.reservaAsientos.findMany({
      where: { id_reserva: BigInt(id) },
    });

    await this.prisma.$transaction([
      this.prisma.asientosFuncion.updateMany({
        where: {
          id: { in: asientosReservados.map((ar) => ar.id_asiento_funcion) },
        },
        data: { estado: 'disponible', id_usuario: null },
      }),
      this.prisma.reservas.update({
        where: { id: BigInt(id) },
        data: { estado: 'cancelada' },
      }),
    ]);

    return {
      message: 'Reserva cancelada con exito.',
      reembolso: reembolsoInfo,
    };
  }

  async getReservas(dto: ReservasFilterDto) {
    if (dto.id_cine) {
      const cine = await this.prisma.cines.findUnique({
        where: { id: BigInt(dto.id_cine) },
        select: { id: true },
      });
      if (!cine) {
        throw new NotFoundException('Cine no existe');
      }
    }

    if (dto.id_pelicula) {
      const pelicula = await this.prisma.peliculas.findUnique({
        where: { id: BigInt(dto.id_pelicula) },
        select: { id: true },
      });
      if (!pelicula) {
        throw new NotFoundException('Pelicula no existe');
      }
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const reservas = await this.prisma.reservas.findMany({
      where: {
        ...(dto.id_usuario && { id_usuario: BigInt(dto.id_usuario) }),
        ...(dto.estado && { estado: dto.estado }),
        ...(dto.numero_reserva && { numero_reserva: dto.numero_reserva }),
        ...(dto.id_pelicula && {
          funciones: { id_pelicula: BigInt(dto.id_pelicula) },
        }),
        ...(dto.id_cine && {
          funciones: { salas: { id_cine: BigInt(dto.id_cine) } },
        }),
        ...((dto.fecha_inicio || dto.fecha_final) && {
          funciones: {
            fecha_hora: {
              ...(dto.fecha_inicio && { gte: new Date(dto.fecha_inicio) }),
              ...(dto.fecha_final && { lte: new Date(dto.fecha_final) }),
            },
          },
        }),
      },
      include: {
        usuarios: { select: { nombre: true, email: true } },
        funciones: {
          select: {
            fecha_hora: true,
            formato: true,
            peliculas: true,
            salas: {
              include: {
                cines: true,
              },
            },
          },
        },
        reservaAsientos: {
          include: {
            asientosfuncion: {
              include: {
                asientos: true,
              },
            },
          },
        },
        pagos: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    return {
      data: reservas,
      meta: { page, limit },
    };
  }

  async exportReservas() {
    const reservas = await this.prisma.reservas.findMany({
      include: {
        usuarios: {
          select: { nombre: true, email: true },
        },
        funciones: {
          include: {
            peliculas: { select: { titulo: true } },
          },
        },
        pagos: {
          select: { monto_final: true },
        },
      },
    });
    if (reservas.length === 0) {
      throw new NotFoundException('No hay reservas para exportar');
    }

    const columnas = [
      'Numero de reserva',
      'Nombre de usuario',
      'Email',
      'Titulo de pelicula',
      'Estado de reserva',
      'Monto Total',
    ];

    const filas = reservas.map((res) => [
      res.numero_reserva,
      res.usuarios.nombre,
      res.usuarios.email,
      res.funciones.peliculas.titulo,
      res.estado,
      res.pagos[0]?.monto_final ?? '',
    ]);

    // Fix: was `filas.join` (always identical rows), must be `f.join` (each row)
    return [columnas, ...filas.map((f) => f.join(', '))].join('\n');
  }
}
