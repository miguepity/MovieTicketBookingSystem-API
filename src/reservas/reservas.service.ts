import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReservasBodyDto } from './dto/reservas.body.dto';
import { ReservasFilterDto } from './dto/reservas.filter.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReservasService {
  constructor(private readonly prisma: PrismaService) {}

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

      await tx.asientosFuncion.updateMany({
        where: { id: { in: dto.id_asientos.map(BigInt) } },
        data: { estado: 'reservado', id_usuario: BigInt(dto.id_usuario) },
      });

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
    if (findReserva.estado === 'cancelado') {
      throw new BadRequestException('La reserva ya está cancelada');
    }
    if (findReserva.estado === 'pagada') {
      throw new BadRequestException(
        'No se puede cancelar una reserva pagada. Solicite un reembolso.',
      );
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
        data: { estado: 'cancelado' },
      }),
    ]);

    return 'Reserva cancelada con exito.';
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
        funciones: {
          include: {
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
    const csv = [columnas, ...filas.map((f) => f.join(', '))].join('\n');

    const reservasDir = path.join(process.cwd(), 'reporte de reserva');
    if (!fs.existsSync(reservasDir)) {
      fs.mkdirSync(reservasDir, { recursive: true });
    }

    const filePath = path.join(
      reservasDir,
      `reportes_reservas_${Date.now()}.csv`,
    );
    fs.writeFileSync(filePath, csv);

    return {
      message: 'Archivo CSV generado en carpeta reporte de reserva',
      filePath,
      reservas,
    };
  }
}
