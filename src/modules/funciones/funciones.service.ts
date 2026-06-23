import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFuncionDto } from './dto/create-funcion.dto';
import { UpdateFuncionDto } from './dto/update-funcion.dto';
import { FuncionCanceladaEvent } from './events/funcion-cancelada.event';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotFuncion } from '../audit-log/snapshots';
import { EstadoAsiento } from '../../common/enums/estado-asiento.enum';
import { EstadoFuncion } from '../../common/enums/estado-funcion.enum';
import { FuncionEstado } from '../../../generated/prisma/client';

@Injectable()
export class FuncionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly auditLog: AuditLogService,
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

  async create(dto: CreateFuncionDto, auditorId: bigint) {
    const fecha = new Date(dto.fecha_hora);

    const pelicula = await this.prisma.peliculas.findUnique({
      where: { id: BigInt(dto.id_pelicula) },
      select: { activo: true },
    });
    if (!pelicula) {
      throw new NotFoundException('La película no existe');
    }
    if (!pelicula.activo) {
      throw new BadRequestException(
        'No se puede crear una función para una película desactivada',
      );
    }

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

    const creada = await this.prisma.funciones.findUnique({
      where: { id: funcion.id },
      include: { peliculas: true, salas: true },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'FUNCION_CREAR',
      entidad: 'Funcion',
      entidad_id: funcion.id,
      detalle: `Función ${funcion.id.toString()} creada (pelicula=${dto.id_pelicula}, sala=${dto.id_sala})`,
      valor_nuevo: creada ? snapshotFuncion(creada) : undefined,
    });

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
      estado: EstadoAsiento.DISPONIBLE,
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

  async findOne(id: string) {
    const funcion = await this.prisma.funciones.findUnique({
      where: { id: BigInt(id) },
      include: {
        peliculas: true,
        salas: true,
        asientosFuncions: true,
      },
    });
    if (!funcion) {
      throw new NotFoundException({
        code: 'FUNCION_NO_ENCONTRADA',
        message: 'La función no existe',
      });
    }
    return funcion;
  }

  async update(id: string, dto: UpdateFuncionDto, auditorId: bigint) {
    const id_funcion = BigInt(id);

    const funcion = await this.prisma.funciones.findUnique({
      where: { id: id_funcion },
      include: {
        asientosFuncions: true,
        peliculas: true,
        salas: true,
      },
    });

    if (!funcion) {
      throw new NotFoundException('Función no existe');
    }

    const tieneReservas = (funcion.asientosFuncions ?? []).some(
      (a) => a.id_usuario !== null || a.estado !== EstadoAsiento.DISPONIBLE,
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
      estado?: FuncionEstado;
    } = {};

    if (dto.id_pelicula) data.id_pelicula = BigInt(dto.id_pelicula);
    if (dto.id_sala) data.id_sala = BigInt(dto.id_sala);
    if (dto.fecha_hora) data.fecha_hora = new Date(dto.fecha_hora);
    if (dto.estado) data.estado = dto.estado;

    const updated = await this.prisma.funciones.update({
      where: { id: id_funcion },
      data,
    });

    const updatedFull = await this.prisma.funciones.findUnique({
      where: { id: id_funcion },
      include: { peliculas: true, salas: true },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'FUNCION_EDITAR',
      entidad: 'Funcion',
      entidad_id: id_funcion,
      detalle: `Función ${id} editada`,
      valor_anterior: snapshotFuncion(funcion),
      valor_nuevo: updatedFull ? snapshotFuncion(updatedFull) : undefined,
    });

    return updated;
  }

  async cancelar(id: string, auditorId: bigint) {
    const id_funcion = BigInt(id);

    const funcion = await this.prisma.funciones.findUnique({
      where: { id: id_funcion },
      include: { peliculas: true, salas: true },
    });

    if (!funcion) {
      throw new NotFoundException('Función no existe');
    }

    if (funcion.estado === EstadoFuncion.CANCELADA) {
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
        estado: EstadoFuncion.CANCELADA,
      },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'FUNCION_CANCELAR',
      entidad: 'Funcion',
      entidad_id: id_funcion,
      detalle: `Función ${id} cancelada`,
      valor_anterior: snapshotFuncion(funcion),
    });

    this.eventEmitter.emit(
      FuncionCanceladaEvent.NAME,
      new FuncionCanceladaEvent(updated.id.toString()),
    );

    return updated;
  }
}
