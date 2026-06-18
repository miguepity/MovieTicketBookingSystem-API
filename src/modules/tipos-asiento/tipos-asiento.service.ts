import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTipoAsientoDto } from './dto/create-tipo-asiento.dto';
import { UpdateTipoAsientoDto } from './dto/update-tipo-asiento.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotTipoAsiento } from '../audit-log/snapshots';

@Injectable()
export class TiposAsientoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAll(nombre?: string) {
    const trimmed = nombre?.trim();
    const tipos = await this.prisma.tiposAsiento.findMany({
      where: trimmed
        ? { nombre: { contains: trimmed, mode: 'insensitive' } }
        : undefined,
      orderBy: { nombre: 'asc' },
    });
    return tipos.map((t) => ({
      id: t.id.toString(),
      nombre: t.nombre,
      color: t.color,
    }));
  }

  async findOne(id: string) {
    const tipoId = this.parseId(id);
    const tipo = await this.prisma.tiposAsiento.findUnique({
      where: { id: tipoId },
    });
    if (!tipo) {
      throw new NotFoundException('Tipo de asiento no encontrado');
    }
    return { id: tipo.id.toString(), nombre: tipo.nombre, color: tipo.color };
  }

  async create(dto: CreateTipoAsientoDto, auditorId: bigint) {
    await this.assertNombreDisponible(dto.nombre);
    const tipo = await this.prisma.tiposAsiento.create({
      data: { nombre: dto.nombre, color: dto.color ?? null },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'TIPO_ASIENTO_CREAR',
      entidad: 'TipoAsiento',
      entidad_id: tipo.id,
      detalle: `Tipo de asiento ${tipo.id.toString()} (${tipo.nombre}) creado`,
      valor_nuevo: snapshotTipoAsiento(tipo),
    });

    return { id: tipo.id.toString(), nombre: tipo.nombre, color: tipo.color };
  }

  async update(id: string, dto: UpdateTipoAsientoDto, auditorId: bigint) {
    const tipoId = this.parseId(id);
    const prev = await this.prisma.tiposAsiento.findUnique({
      where: { id: tipoId },
    });
    if (!prev) {
      throw new NotFoundException('Tipo de asiento no encontrado');
    }

    if (dto.nombre !== undefined) {
      await this.assertNombreDisponible(dto.nombre, tipoId);
    }

    const tipo = await this.prisma.tiposAsiento.update({
      where: { id: tipoId },
      data: {
        ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
      },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'TIPO_ASIENTO_EDITAR',
      entidad: 'TipoAsiento',
      entidad_id: tipo.id,
      detalle: `Tipo de asiento ${tipo.id.toString()} (${tipo.nombre}) actualizado`,
      valor_anterior: snapshotTipoAsiento(prev),
      valor_nuevo: snapshotTipoAsiento(tipo),
    });

    return { id: tipo.id.toString(), nombre: tipo.nombre, color: tipo.color };
  }

  async remove(id: string, auditorId: bigint) {
    const tipoId = this.parseId(id);
    const existing = await this.prisma.tiposAsiento.findUnique({
      where: { id: tipoId },
    });
    if (!existing) {
      throw new NotFoundException('Tipo de asiento no encontrado');
    }

    const asientosCount = await this.prisma.asientos.count({
      where: { id_tipo_asiento: tipoId },
    });
    if (asientosCount > 0) {
      throw new ConflictException(
        'No se puede eliminar: el tipo tiene asientos asociados',
      );
    }

    const preciosCount = await this.prisma.preciosCine.count({
      where: { id_tipo_asiento: tipoId },
    });
    if (preciosCount > 0) {
      throw new ConflictException(
        'No se puede eliminar: el tipo tiene precios configurados en algún cine',
      );
    }

    await this.prisma.tiposAsiento.delete({ where: { id: tipoId } });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'TIPO_ASIENTO_ELIMINAR',
      entidad: 'TipoAsiento',
      entidad_id: tipoId,
      detalle: `Tipo de asiento ${tipoId.toString()} (${existing.nombre}) eliminado`,
      valor_anterior: snapshotTipoAsiento(existing),
    });

    return { id: tipoId.toString() };
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
    const existente = await this.prisma.tiposAsiento.findUnique({
      where: { nombre },
      select: { id: true },
    });
    if (existente && existente.id !== excludeId) {
      throw new ConflictException(
        'Ya existe un tipo de asiento con ese nombre',
      );
    }
  }
}
