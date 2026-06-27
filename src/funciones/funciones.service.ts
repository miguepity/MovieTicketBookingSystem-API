import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateFuncioneDto } from './dto/create-funcione.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { UpdateFuncioneDto } from './dto/update-funcione.dto';
import { Cron } from '@nestjs/schedule';

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

  @Cron('* * * * *')
  async liberarAsientosJob() {
    const now = new Date();

    const asientosALiberar = await this.prisma.asientosFuncion.findMany({
      where: {
        estado: 'bloqueado',
        bloqueado_hasta: {
          lt: now,
        },
      },
    });

    for (const asiento of asientosALiberar) {
      await this.prisma.asientosFuncion.update({
        where: { id: asiento.id },
        data: {
          estado: 'disponible',
          version: asiento.version + 1,
          bloqueado_hasta: undefined,
        },
      });
    }

    console.log('Asientos bloqueados liberados: ', asientosALiberar.length);
  }

  async getAsientos(id: number) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(id) },
    });

    if (!funcion) throw new NotFoundException('Función no encontrada');

    const asientosFuncion = await this.prisma.asientosFuncion.findMany({
      where: { id_funcion: BigInt(id) },
      include: { asientos: true },
      orderBy: [
        { asientos: { fila: 'asc' } },
        { asientos: { columna: 'asc' } },
      ],
    });

    return asientosFuncion.reduce<Record<string, object[]>>((acc, af) => {
      const fila = af.asientos.fila;
      if (!acc[fila]) acc[fila] = [];
      acc[fila].push({
        id: af.id.toString(),
        id_asiento: af.id_asiento.toString(),
        columna: af.asientos.columna,
        codigo: af.asientos.codigo,
        tipo: af.asientos.tipo,
        estado: af.estado,
        bloqueado_hasta: af.bloqueado_hasta,
      });
      return acc;
    }, {});
  }

  async bloquearAsientos(id_asiento: bigint, id_funcion: bigint) {
    const asientoExistente = await this.prisma.asientosFuncion.findFirst({
      where: {
        id_asiento: id_asiento,
        id_funcion: id_funcion,
      },
    });

    if (!asientoExistente) {
      throw new BadRequestException(
        'Asiento no encontrado para la función especificada',
      );
    }

    if (asientoExistente.estado === 'bloqueado') {
      throw new ConflictException({
        message: 'El asiento ya está bloqueado',
        asiento: {
          ...asientoExistente,
          id_asiento: asientoExistente.id_asiento.toString(),
          id_funcion: asientoExistente.id_funcion.toString(),
          id: asientoExistente.id.toString(),
        },
      });
    }

    const updatedAsiento = await this.prisma.asientosFuncion.update({
      where: { id: asientoExistente.id },
      data: {
        estado: 'bloqueado',
        version: asientoExistente.version + 1,
        bloqueado_hasta: new Date(
          Date.now() + parseInt(process.env.SEAT_BLOCK_SECONDS || '180') * 1000,
        ),
      },
    });

    return updatedAsiento;
  }
}
