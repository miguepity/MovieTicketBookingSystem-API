import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SalaResponseDto } from './dto/sala.response.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotSala } from '../audit-log/snapshots';

@Injectable()
export class SalasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async create(
    createSalaDto: CreateSalaDto,
    auditorId: bigint,
  ): Promise<SalaResponseDto> {
    await this.assertNombreDisponible(createSalaDto.nombre);

    const created = await this.prisma.$transaction(async (tx) => {
      const sala = await tx.salas.create({
        data: {
          nombre: createSalaDto.nombre,
          id_cine: BigInt(createSalaDto.id_cine),
          filas: createSalaDto.filas,
          columnas: createSalaDto.columnas,
        },
        include: { cines: true },
      });

      const tipoDefault = await tx.tiposAsiento.findFirst({
        orderBy: { id: 'asc' },
      });
      if (!tipoDefault) {
        throw new Error('No hay TiposAsiento configurados');
      }

      const asientosData: Array<{
        id_sala: bigint;
        fila: string;
        columna: number;
        codigo: string;
        id_tipo_asiento: bigint;
      }> = [];

      for (let f = 0; f < sala.filas; f++) {
        const filaLetra = String.fromCharCode(65 + f);
        for (let c = 1; c <= sala.columnas; c++) {
          asientosData.push({
            id_sala: sala.id,
            fila: filaLetra,
            columna: c,
            codigo: `${filaLetra}${c}`,
            id_tipo_asiento: tipoDefault.id,
          });
        }
      }

      await tx.asientos.createMany({ data: asientosData });

      return sala;
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'SALA_CREAR',
      entidad: 'Sala',
      entidad_id: created.id,
      detalle: `Sala ${created.id.toString()} (${created.nombre}) creada`,
      valor_nuevo: snapshotSala(created),
    });

    return this.toDto(created);
  }

  async findAll(id_cine?: string): Promise<SalaResponseDto[]> {
    const where = id_cine ? { id_cine: this.parseId(id_cine) } : undefined;

    const salas = await this.prisma.salas.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });

    return salas.map((s) => this.toDto(s));
  }

  async findOne(id: string): Promise<SalaResponseDto> {
    const salaId = this.parseId(id);
    const sala = await this.prisma.salas.findUnique({ where: { id: salaId } });

    if (!sala) {
      throw new NotFoundException('Sala no encontrada');
    }

    return this.toDto(sala);
  }

  async update(
    id: string,
    updateSalaDto: UpdateSalaDto,
    auditorId: bigint,
  ): Promise<SalaResponseDto> {
    const salaId = this.parseId(id);
    const prev = await this.prisma.salas.findUnique({
      where: { id: salaId },
      include: { cines: true },
    });
    if (!prev) {
      throw new NotFoundException('Sala no encontrada');
    }

    if (updateSalaDto.nombre !== undefined) {
      await this.assertNombreDisponible(updateSalaDto.nombre, salaId);
    }

    const funcionesActivas = await this.prisma.funciones.count({
      where: {
        id_sala: salaId,
        fecha_hora: { gte: new Date() },
      },
    });

    const updated = await this.prisma.salas.update({
      where: { id: salaId },
      data: {
        nombre: updateSalaDto.nombre,
        id_cine:
          updateSalaDto.id_cine !== undefined
            ? BigInt(updateSalaDto.id_cine)
            : undefined,
        filas: updateSalaDto.filas,
        columnas: updateSalaDto.columnas,
      },
      include: { cines: true },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'SALA_EDITAR',
      entidad: 'Sala',
      entidad_id: updated.id,
      detalle: `Sala ${updated.id.toString()} (${updated.nombre}) actualizada`,
      valor_anterior: snapshotSala(prev),
      valor_nuevo: snapshotSala(updated),
    });

    const result = this.toDto(updated);
    if (funcionesActivas > 0) {
      result.warning = `La sala tiene ${funcionesActivas} función(es) activa(s). Los cambios pueden afectar las reservas existentes.`;
    }

    return result;
  }

  async remove(id: string, auditorId: bigint): Promise<{ id: number }> {
    const salaId = this.parseId(id);
    const existing = await this.prisma.salas.findUnique({
      where: { id: salaId },
      include: { cines: true },
    });
    if (!existing) {
      throw new NotFoundException('Sala no encontrada');
    }

    const funcionesCount = await this.prisma.funciones.count({
      where: { id_sala: salaId },
    });

    if (funcionesCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la sala porque tiene funciones asociadas',
      );
    }

    const deleted = await this.prisma.$transaction(async (tx) => {
      await tx.asientosFuncion.deleteMany({
        where: { asientos: { id_sala: salaId } },
      });
      await tx.asientos.deleteMany({ where: { id_sala: salaId } });
      return tx.salas.delete({
        where: { id: salaId },
        select: { id: true },
      });
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'SALA_ELIMINAR',
      entidad: 'Sala',
      entidad_id: deleted.id,
      detalle: `Sala ${deleted.id.toString()} (${existing.nombre}) eliminada`,
      valor_anterior: snapshotSala(existing),
    });

    return { id: Number(deleted.id) };
  }

  private toDto(sala: {
    id: bigint;
    nombre: string;
    id_cine: bigint;
    filas: number;
    columnas: number;
  }): SalaResponseDto {
    return {
      id: Number(sala.id),
      nombre: sala.nombre,
      id_cine: Number(sala.id_cine),
      filas: sala.filas,
      columnas: sala.columnas,
    };
  }

  private parseId(id: string): bigint {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException('ID inválido');
    }
  }

  private async assertNombreDisponible(
    nombre: string,
    excludeId?: bigint,
  ): Promise<void> {
    const existing = await this.prisma.salas.findFirst({
      where: { nombre },
      select: { id: true },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `Ya existe una sala con el nombre "${nombre}"`,
      );
    }
  }
}
