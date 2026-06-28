import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateFuncionDto } from './dto/create-funcion.dto';
import { UpdateFuncionDto } from './dto/update-funcion.dto';
import { BloquearAsientoDto } from '../asientos/dto/bloquear-asiento.dto';

@Injectable()
export class FuncionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(createFuncionDto: CreateFuncionDto) {
    const pelicula = await this.prisma.peliculas.findUnique({
      where: { id: createFuncionDto.id_pelicula },
    });
    if (!pelicula) throw new NotFoundException('Película no encontrada');
    if (!pelicula.activo)
      throw new BadRequestException(
        'No se puede crear una función para una película inactiva',
      );

    return this.prisma.$transaction(async (tx) => {
      const funcion = await tx.funciones.create({
        data: {
          id_pelicula: createFuncionDto.id_pelicula,
          id_sala: createFuncionDto.id_sala,
          fecha_hora: new Date(createFuncionDto.fecha_hora),
          estado: createFuncionDto.estado,
        },
      });

      const asientos = await tx.asientos.findMany({
        where: { id_sala: BigInt(createFuncionDto.id_sala) },
        select: { id: true },
      });

      if (asientos.length > 0) {
        await tx.asientosFuncion.createMany({
          data: asientos.map((a) => ({
            id_asiento: a.id,
            id_funcion: funcion.id,
            estado: 'disponible',
            version: 0,
          })),
        });
      }

      return funcion;
    });
  }

  async update(id: number, updateFuncionDto: UpdateFuncionDto) {
    const funcion = await this.prisma.funciones.findUnique({ where: { id } });
    if (!funcion) throw new NotFoundException('Función no encontrada');

    return this.prisma.funciones.update({
      where: { id },
      data: {
        ...(updateFuncionDto.id_pelicula !== undefined && {
          id_pelicula: updateFuncionDto.id_pelicula,
        }),
        ...(updateFuncionDto.id_sala !== undefined && {
          id_sala: updateFuncionDto.id_sala,
        }),
        ...(updateFuncionDto.fecha_hora !== undefined && {
          fecha_hora: new Date(updateFuncionDto.fecha_hora),
        }),
        ...(updateFuncionDto.estado !== undefined && {
          estado: updateFuncionDto.estado,
        }),
      },
    });
  }

  async cancel(id: number) {
    const funcion = await this.prisma.funciones.findUnique({ where: { id } });
    if (!funcion) throw new NotFoundException('Función no encontrada');

    return this.prisma.funciones.update({
      where: { id },
      data: { estado: 'cancelada' },
    });
  }

  async cancelarFuncion(id: number) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(id) },
      include: { peliculas: true },
    });

    if (!funcion) throw new NotFoundException('Función no encontrada');
    if (funcion.estado === 'cancelada')
      throw new BadRequestException('La función ya está cancelada');

    // 1. Identificar reservas activas antes de cancelar
    const reservasAfectadas = await this.prisma.reservas.findMany({
      where: {
        id_funcion: BigInt(id),
        estado: { not: 'cancelada' },
      },
      include: {
        usuarios: {
          select: { nombre: true, email: true },
        },
      },
    });

    // 2. Cancelar la función
    await this.prisma.funciones.update({
      where: { id: BigInt(id) },
      data: { estado: 'cancelada' },
    });

    // 3. Cancelar todas las reservas activas de la función
    await this.prisma.reservas.updateMany({
      where: {
        id_funcion: BigInt(id),
        estado: { not: 'cancelada' },
      },
      data: { estado: 'cancelada' },
    });

    // 4. Envío masivo de emails — Promise.allSettled para no abortar si uno falla
    const resultadosEmail = await Promise.allSettled(
      reservasAfectadas.map((reserva) =>
        this.emailService.sendCancelacionFuncion(
          reserva.usuarios.email,
          reserva.usuarios.nombre,
          funcion.peliculas.titulo,
          funcion.fecha_hora,
          reserva.numero_reserva,
        ),
      ),
    );

    const emailsEnviados = resultadosEmail.filter(
      (r) => r.status === 'fulfilled',
    ).length;
    const emailsFallidos = resultadosEmail.filter(
      (r) => r.status === 'rejected',
    ).length;

    return {
      message: 'Función cancelada exitosamente',
      reservas_afectadas: reservasAfectadas.length,
      emails_enviados: emailsEnviados,
      emails_fallidos: emailsFallidos,
    };
  }

  async getReservasActivasByFuncion(id: number) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(id) },
    });

    if (!funcion) throw new NotFoundException('Función no encontrada');

    return this.prisma.reservas.findMany({
      where: {
        id_funcion: BigInt(id),
        estado: { not: 'cancelada' },
      },
      include: {
        usuarios: {
          select: { id: true, nombre: true, email: true },
        },
      },
    });
  }

  async getAsientosByFuncion(id: number) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(id) },
    });

    if (!funcion) throw new NotFoundException('Función no encontrada');

    return this.prisma.asientosFuncion.findMany({
      where: { id_funcion: BigInt(id) },
      include: {
        asientos: {
          select: {
            id: true,
            fila: true,
            columna: true,
            codigo: true,
            tipo: true,
          },
        },
      },
    });
  }
  async bloquearAsientos(id_funcion: number, dto: BloquearAsientoDto) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(id_funcion) },
    });

    if (!funcion) throw new NotFoundException('Función no encontrada');

    const bloqueado_hasta = new Date(Date.now() + dto.minutos * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      // Verificar que todos los asientos existen y pertenecen a la función
      const asientos = await tx.asientosFuncion.findMany({
        where: {
          id: { in: dto.ids_asientos_funcion.map(BigInt) },
          id_funcion: BigInt(id_funcion),
        },
      });

      if (asientos.length !== dto.ids_asientos_funcion.length) {
        throw new BadRequestException(
          'Uno o más asientos no existen o no pertenecen a esta función',
        );
      }

      // Bloqueo optimista: el WHERE exige estado='disponible' en el momento
      // de escribir (no solo en una lectura previa), así que si otra
      // solicitud concurrente ya bloqueó alguno de estos asientos, count
      // será menor al esperado y se revierte toda la operación.
      const resultado = await tx.asientosFuncion.updateMany({
        where: {
          id: { in: dto.ids_asientos_funcion.map(BigInt) },
          id_funcion: BigInt(id_funcion),
          estado: 'disponible',
        },
        data: {
          estado: 'bloqueado',
          bloqueado_hasta,
          id_usuario: BigInt(dto.id_usuario),
          version: { increment: 1 },
        },
      });

      if (resultado.count !== dto.ids_asientos_funcion.length) {
        throw new ConflictException(
          'Uno o más asientos ya no están disponibles',
        );
      }

      return {
        message: `${dto.ids_asientos_funcion.length} asiento(s) bloqueados por ${dto.minutos} minuto(s)`,
        bloqueado_hasta,
      };
    });
  }
}
