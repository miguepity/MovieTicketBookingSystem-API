import { Injectable, Logger } from '@nestjs/common';
import { CreateFuncioneDto } from './dto/create-funcione.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { UpdateFuncioneDto } from './dto/update-funcione.dto';

@Injectable()
export class FuncionesService {
  private readonly logger = new Logger(FuncionesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(createFuncioneDto: CreateFuncioneDto) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Create the function
      const funcion = await tx.funciones.create({
        data: {
          id_pelicula: BigInt(createFuncioneDto.id_pelicula),
          id_sala: BigInt(createFuncioneDto.id_sala),
          fecha_hora: new Date(createFuncioneDto.fecha_hora),
          estado: 'active',
        },
      });

      // 2. Get all seats for the room
      const asientos = await tx.asientos.findMany({
        where: { id_sala: BigInt(createFuncioneDto.id_sala) },
      });

      // 3. Create AsientosFuncion for each seat
      if (asientos.length > 0) {
        await tx.asientosFuncion.createMany({
          data: asientos.map((asiento) => ({
            id_asiento: asiento.id,
            id_funcion: funcion.id,
            estado: 'disponible',
            version: 1,
          })),
        });
      }

      return funcion;
    });
  }

  async cancel(id: string) {
    const funcion = await this.prisma.funciones.update({
      where: { id: BigInt(id) },
      data: { estado: 'cancelada' },
      include: { peliculas: { select: { titulo: true } } },
    });

    const reservas = await this.prisma.reservas.findMany({
      where: { id_funcion: BigInt(id) },
      include: {
        usuarios: {
          select: { email: true, nombre: true, notificaciones_activas: true },
        },
      },
    });

    const sentEmails = new Set<string>();
    for (const reserva of reservas) {
      const user = reserva.usuarios;
      if (!user.notificaciones_activas || sentEmails.has(user.email)) continue;
      sentEmails.add(user.email);

      try {
        await this.mailService.sendEmail(
          user.email,
          'Función cancelada - MovieSys',
          `<h1>Hola ${user.nombre}</h1><p>Lamentamos informarte que la función <strong>${funcion.peliculas.titulo}</strong> del ${new Date(funcion.fecha_hora).toLocaleString()} ha sido cancelada.</p><p>Si realizaste un pago, recibirás un reembolso pronto.</p>`,
        );
      } catch (e) {
        this.logger.error(`Error al enviar email a ${user.email}: ${e}`);
      }
    }

    return;
  }

  async edit(id: string, dto: UpdateFuncioneDto) {
    const funcion = await this.prisma.funciones.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.id_pelicula && { id_pelicula: BigInt(dto.id_pelicula) }),
        ...(dto.id_sala && { id_sala: BigInt(dto.id_sala) }),
        ...(dto.fecha_hora && { fecha_hora: new Date(dto.fecha_hora) }),
      },
      include: { peliculas: { select: { titulo: true } } },
    });

    const reservas = await this.prisma.reservas.findMany({
      where: { id_funcion: BigInt(id) },
      include: {
        usuarios: {
          select: { email: true, nombre: true, notificaciones_activas: true },
        },
      },
    });

    const sentEmails = new Set<string>();
    for (const reserva of reservas) {
      const user = reserva.usuarios;
      if (!user.notificaciones_activas || sentEmails.has(user.email)) continue;
      sentEmails.add(user.email);

      try {
        await this.mailService.sendEmail(
          user.email,
          'Cambios a tu Función - MovieSys',
          `<h1>Hola ${user.nombre}</h1><p>La función <strong>${funcion.peliculas.titulo}</strong> del ${new Date(funcion.fecha_hora).toLocaleString()} ha sido actualizada.</p>`,
        );
      } catch (e) {
        this.logger.error(`Error al enviar email a ${user.email}: ${e}`);
      }
    }

    return funcion;
  }
}
