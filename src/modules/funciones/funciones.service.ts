import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFuncionDto } from './dto/create-funcion.dto';
import { UpdateFuncionDto } from './dto/update-funcion.dto';
import { FuncionCanceladaEvent } from './events/funcion-cancelada.event';

@Injectable()
export class FuncionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async checkConflicto(
    id_sala: bigint,
    fecha: Date,
    excludeId?: bigint,
  ) {
    return this.prisma.funciones.findFirst({
      where: {
        id_sala,
        fecha_hora: fecha,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
  }

  async create(dto: CreateFuncionDto) {
    const fecha = new Date(dto.fecha_hora);

    const conflicto = await this.checkConflicto(BigInt(dto.id_sala), fecha);

    if (conflicto) {
      throw new ConflictException(
        'Ya existe una función programada para esa sala y horario',
      );
    }

    const funcion = await this.prisma.funciones.create({
      data: {
        id_pelicula: BigInt(dto.id_pelicula),
        id_sala: BigInt(dto.id_sala),
        fecha_hora: fecha,
        estado: dto.estado,
      },
    });

    await this.generarAsientos(funcion.id);

    return funcion;
  }

  async generarAsientos(id_funcion: bigint) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: id_funcion },
      include: {
        salas: {
          include: {
            asientos: true,
          },
        },
      },
    });

    if (!funcion) {
      throw new NotFoundException('Función no existe');
    }

    if (!funcion.salas) {
      throw new NotFoundException('La función no tiene sala asignada');
    }

    const data = funcion.salas.asientos.map((a) => ({
      id_asiento: a.id,
      id_funcion,
      estado: 'DISPONIBLE',
      id_usuario: null,
      version: 1,
      bloqueado_hasta: new Date(),
    }));

    return this.prisma.asientosFuncion.createMany({ data });
  }

  findAll() {
    return this.prisma.funciones.findMany({
      include: {
        peliculas: true,
        salas: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.funciones.findUnique({
      where: { id: BigInt(id) },
      include: {
        peliculas: true,
        salas: true,
        asientosFuncions: true,
      },
    });
  }

  async update(id: string, dto: UpdateFuncionDto) {
    const id_funcion = BigInt(id);

    const funcion = await this.prisma.funciones.findUnique({
      where: { id: id_funcion },
      include: {
        asientosFuncions: true,
      },
    });

    if (!funcion) {
      throw new NotFoundException('Función no existe');
    }

    const tieneReservas = (funcion.asientosFuncions ?? []).some(
      (a) => a.id_usuario !== null || a.estado !== 'DISPONIBLE',
    );

    if (tieneReservas) {
      throw new ConflictException(
        'No se puede editar la función porque ya existen reservas',
      );
    }

    if (dto.fecha_hora || dto.id_sala) {
      const salaId = dto.id_sala ? BigInt(dto.id_sala) : funcion.id_sala;

      const fechaFinal = dto.fecha_hora
        ? new Date(dto.fecha_hora)
        : funcion.fecha_hora;

      const conflicto = await this.checkConflicto(
        salaId,
        fechaFinal,
        id_funcion,
      );

      if (conflicto) {
        throw new ConflictException(
          'Ya existe otra función en esa sala y horario',
        );
      }
    }

    const data: {
      id_pelicula?: bigint;
      id_sala?: bigint;
      fecha_hora?: Date;
      estado?: string;
    } = {};

    if (dto.id_pelicula) data.id_pelicula = BigInt(dto.id_pelicula);
    if (dto.id_sala) data.id_sala = BigInt(dto.id_sala);
    if (dto.fecha_hora) data.fecha_hora = new Date(dto.fecha_hora);
    if (dto.estado) data.estado = dto.estado;

    return this.prisma.funciones.update({
      where: { id: id_funcion },
      data,
    });
  }

  async cancelar(id: string) {
    const id_funcion = BigInt(id);

    const funcion = await this.prisma.funciones.findUnique({
      where: { id: id_funcion },
    });

    if (!funcion) {
      throw new NotFoundException('Función no existe');
    }

    if (funcion.estado === 'CANCELADA') {
      throw new ConflictException('La función ya está cancelada');
    }

    if (funcion.fecha_hora < new Date()) {
      throw new ConflictException(
        'No se puede cancelar una función ya iniciada',
      );
    }

    const updated = await this.prisma.funciones.update({
      where: { id: id_funcion },
      data: {
        estado: 'CANCELADA',
      },
    });

    this.eventEmitter.emit(
      FuncionCanceladaEvent.NAME,
      new FuncionCanceladaEvent(updated.id.toString()),
    );

    return updated;
  }

  async findDisponiblesPorCine(id_cine: string) {
    return this.prisma.funciones.findMany({
      where: {
        salas: { id_cine: BigInt(id_cine) },
        estado: { not: 'CANCELADA' },
        fecha_hora: { gte: new Date() },
      },
      include: {
        peliculas: true,
        salas: { include: { cines: true } },
      },
      orderBy: { fecha_hora: 'asc' },
    });
  }
}
