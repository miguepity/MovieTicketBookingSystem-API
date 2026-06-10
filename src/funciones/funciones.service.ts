import { Injectable } from '@nestjs/common';
import { CreateFuncioneDto } from './dto/create-funcione.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class FuncionesService {
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

      void this.mailService.sendEmail(
        user.email,
        'Función cancelada - MovieSys',
        `<h1>Hola ${user.nombre}</h1><p>Lamentamos informarte que la función <strong>${funcion.peliculas.titulo}</strong> del ${new Date(funcion.fecha_hora).toLocaleString()} ha sido cancelada.</p><p>Si realizaste un pago, recibirás un reembolso pronto.</p>`,
      );
    }

    return;
  }

  async getFuncionesPorCine(idPelicula: string, idCine: string) {
    const funciones = await this.prisma.funciones.findMany({
      where: {
        id_pelicula: BigInt(idPelicula),
        salas: {
          id_cine: BigInt(idCine),
        },
        estado: 'active',
      },
      select: {
        id: true,
        fecha_hora: true,
        salas: {
          select: {
            id: true,
            nombre: true,
            filas: true,
            columnas: true,
          },
        },
        asientosFuncions: {
          select: {
            id: true,
            estado: true,
          },
        },
      },
      orderBy: {
        fecha_hora: 'asc',
      },
    });

    return funciones.map((funcion) => {
      const totalAsientos = funcion.asientosFuncions.length;
      const asientosDisponibles = funcion.asientosFuncions.filter(
        (a) => a.estado === 'disponible',
      ).length;

      return {
        id: funcion.id.toString(),
        fecha_hora: funcion.fecha_hora,
        sala: {
          id: funcion.salas.id.toString(),
          nombre: funcion.salas.nombre,
          filas: funcion.salas.filas,
          columnas: funcion.salas.columnas,
        },
        disponibilidad: {
          total: totalAsientos,
          disponibles: asientosDisponibles,
          ocupados: totalAsientos - asientosDisponibles,
          porcentaje_disponibilidad: Math.round(
            (asientosDisponibles / totalAsientos) * 100,
          ),
        },
      };
    });
  }
}
