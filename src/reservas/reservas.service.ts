import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class ReservasService {
  private readonly logger = new Logger(ReservasService.name);

  constructor(
    private prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  readonly email_cancelacion_reserva: string = `
  <!DOCTYPE html>

  <html>
  <head>
    <meta charset="UTF-8">
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">

      <div style="background: #f57c00; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0;">Reserva Cancelada</h1>
      </div>

      <div style="padding: 24px;">
        <p>Hola <strong>{{nombre}}</strong>,</p>

        <p>
          Te confirmamos que tu reserva
          <strong>{{numero_reserva}}</strong>
          para la película
          <strong>{{pelicula}}</strong>
          ha sido cancelada exitosamente.
        </p>

        <div style="background: #fff3cd; border-left: 4px solid #f57c00; padding: 16px; margin: 20px 0;">
          <strong>Detalles de la reserva:</strong><br>
          Película: {{pelicula}}<br>
          Fecha: {{fecha}}<br>
          Asientos: {{asientos}}
        </div>

        <p>
          Los asientos asociados a esta reserva han sido liberados y ya no estarán apartados a tu nombre.
        </p>

        <p>
          Si realizaste un pago, cualquier proceso de reembolso será gestionado según las políticas del cine.
        </p>

        <p>
          Esperamos verte nuevamente muy pronto.
        </p>

        <p>
          Saludos,<br>
          <strong>Equipo MovieSys</strong>
        </p>
      </div>

      <div style="background: #f1f1f1; padding: 16px; text-align: center; font-size: 12px; color: #666;">
        Este es un mensaje automático. Por favor, no respondas a este correo.
      </div>

    </div>
  </body>
  </html>
  `;

  renderCancelacionReserva(data: {
    nombre: string;
    numero_reserva: string;
    pelicula: string;
    fecha: string;
    asientos: string;
  }): string {
    return this.email_cancelacion_reserva
      .replace('{{nombre}}', data.nombre)
      .replace('{{numero_reserva}}', data.numero_reserva)
      .replace('{{pelicula}}', data.pelicula)
      .replace('{{fecha}}', data.fecha)
      .replace('{{asientos}}', data.asientos);
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

    return await this.prisma.$transaction(async (tx) => {
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

      return this.serialize(reserva);
    });
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
        usuarios: {
          select: {
            nombre: true,
            email: true,
          },
        },
        funciones: {
          include: {
            peliculas: {
              select: {
                titulo: true,
              },
            },
          },
        },
        reservaAsientos: {
          include: {
            asientosfuncion: {
              include: {
                asientos: {
                  select: {
                    codigo: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reserva.estado === 'cancelada') {
      throw new BadRequestException('La reserva ya está cancelada');
    }

    const cancelado = await this.prisma.$transaction(async (tx) => {
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

    if (cancelado) {
      const asientosStr = reserva.reservaAsientos
        .map((ra) => ra.asientosfuncion.asientos.codigo)
        .join(', ');

      const html = this.renderCancelacionReserva({
        nombre: reserva.usuarios.nombre,
        numero_reserva: reserva.numero_reserva,
        pelicula: reserva.funciones.peliculas.titulo,
        fecha: new Date(reserva.funciones.fecha_hora).toLocaleString(),
        asientos: asientosStr,
      });

      try {
        await this.mailService.sendEmail(
          reserva.usuarios.email,
          'Función cancelada - MovieSys',
          html,
        );
      } catch (e) {
        this.logger.error(
          `Error al enviar email a ${reserva.usuarios.email}: ${e}`,
        );
      }
    }
  }
}
