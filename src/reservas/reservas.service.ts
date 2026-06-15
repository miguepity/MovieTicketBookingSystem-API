import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { MailService } from 'src/mail/mail.service';
import { nanoid } from 'nanoid';

@Injectable()
export class ReservasService {
  private readonly logger = new Logger(ReservasService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  readonly email_confirmation: string = `
    <h1>Confirmación de Reserva - MovieSys</h1>
    <p><strong>Reserva:</strong> {{numero_reserva}}</p>
    <p><strong>Película:</strong> {{pelicula}}</p>
    <p><strong>Cine:</strong> {{cine}}</p>
    <p><strong>Asientos:</strong> {{asientos}}</p>
    <p><strong>Total:</strong> Q{{monto}}</p>
    <p>¡Gracias por tu compra!</p>
  `;

  // para usar llamar this.renderEmailConfirmation({ data }).
  renderEmailConfirmation(data: {
    numero_reserva: string;
    pelicula: string;
    cine: string;
    asientos: string;
    monto: string;
  }): string {
    return this.email_confirmation
      .replace('{{numero_reserva}}', data.numero_reserva)
      .replace('{{pelicula}}', data.pelicula)
      .replace('{{cine}}', data.cine)
      .replace('{{asientos}}', data.asientos)
      .replace('{{monto}}', data.monto);
  }

  private serialize<T>(data: T): T {
    return JSON.parse(
      JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    ) as T;
  }

  async create(createReservaDto: CreateReservaDto) {
    const { id_usuario, id_funcion, asientosIds } = createReservaDto;

    // Verificar que los asientos estén disponibles
    const asientos = await this.prisma.asientosFuncion.findMany({
      where: {
        id: { in: asientosIds.map((id) => BigInt(id)) },
        id_funcion: BigInt(id_funcion),
        estado: 'disponible',
      },
    });

    if (asientos.length !== asientosIds.length) {
      throw new BadRequestException('Uno o más asientos no están disponibles');
    }

    const reserva = await this.prisma.$transaction(async (tx) => {
      // 1. Crear la reserva
      const reserva = await tx.reservas.create({
        data: {
          numero_reserva: `RES-${nanoid(10).toUpperCase()}`,
          id_usuario: BigInt(id_usuario),
          id_funcion: BigInt(id_funcion),
          estado: 'pendiente',
        },
      });

      // 2. Asociar los asientos a la reserva
      await tx.reservaAsientos.createMany({
        data: asientosIds.map((asientoId) => ({
          id_reserva: reserva.id,
          id_asiento_funcion: BigInt(asientoId),
        })),
      });

      // 3. Actualizar el estado de los asientos
      await tx.asientosFuncion.updateMany({
        where: {
          id: { in: asientosIds.map((id) => BigInt(id)) },
        },
        data: {
          estado: 'reservado',
          id_usuario: BigInt(id_usuario),
        },
      });

      return reserva;
    });

    const result = this.serialize(reserva);

    try {
      const full = await this.prisma.reservas.findUnique({
        where: { id: reserva.id },
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

        const html = this.renderEmailConfirmation({
          numero_reserva: full.numero_reserva,
          pelicula: full.funciones.peliculas.titulo,
          cine: full.funciones.salas.cines.nombre,
          asientos: asientosStr,
          monto: '0.00',
        });

        await this.mailService.sendEmail(
          full.usuarios.email,
          'Confirmación de Reserva - MovieSys',
          html,
        );
      }
    } catch (e) {
      this.logger.error(`Error al enviar email de confirmación: ${e}`);
    }

    return result;
  }

  async findAll() {
    const reservas = await this.prisma.reservas.findMany({
      include: {
        reservaAsientos: {
          include: {
            asientosfuncion: {
              include: {
                asientos: true,
              },
            },
          },
        },
      },
    });
    return this.serialize(reservas);
  }

  async findOne(id: number) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(id) },
      include: {
        reservaAsientos: {
          include: {
            asientosfuncion: {
              include: {
                asientos: true,
              },
            },
          },
        },
        usuarios: {
          select: {
            nombre: true,
            email: true,
          },
        },
      },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    return this.serialize(reserva);
  }

  async update(id: number, updateReservaDto: UpdateReservaDto) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(id) },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    const updated = await this.prisma.reservas.update({
      where: { id: BigInt(id) },
      data: updateReservaDto,
    });

    return this.serialize(updated);
  }

  async remove(id: number) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id: BigInt(id) },
      include: {
        reservaAsientos: true,
      },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Liberar asientos
      await tx.asientosFuncion.updateMany({
        where: {
          id: {
            in: reserva.reservaAsientos.map((ra) => ra.id_asiento_funcion),
          },
        },
        data: {
          estado: 'disponible',
          id_usuario: null,
        },
      });

      // Eliminar relaciones de asientos
      await tx.reservaAsientos.deleteMany({
        where: { id_reserva: BigInt(id) },
      });

      // Eliminar reserva
      const deleted = await tx.reservas.delete({
        where: { id: BigInt(id) },
      });

      return this.serialize(deleted);
    });
  }

  async cancelar(id: bigint) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id },
      include: {
        reservaAsientos: true,
      },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reserva.estado === 'cancelada') {
      throw new BadRequestException('La reserva ya está cancelada');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Liberar asientos
      await tx.asientosFuncion.updateMany({
        where: {
          id: {
            in: reserva.reservaAsientos.map((ra) => ra.id_asiento_funcion),
          },
        },
        data: {
          estado: 'disponible',
          id_usuario: null,
        },
      });

      // Actualizar estado de la reserva a cancelada
      const updated = await tx.reservas.update({
        where: { id },
        data: { estado: 'cancelada' },
      });

      return this.serialize(updated);
    });
  }
}
