import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import { CreatePrecioCineDto } from './dto/create-precio-cine.dto';
import { UpdatePrecioCineDto } from './dto/update-precio-cine.dto';
import { ListPreciosCineQueryDto } from './dto/list-precios-cine-query.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotPrecioCine } from '../audit-log/snapshots';

type PrecioCinePayload = Prisma.PreciosCineGetPayload<{
  include: {
    cines: { select: { id: true; nombre: true } };
    tipoAsiento: { select: { id: true; nombre: true } };
  };
}>;

@Injectable()
export class PreciosCineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAll(query: ListPreciosCineQueryDto) {
    const where: Prisma.PreciosCineWhereInput = {};
    if (query.id_cine !== undefined) {
      where.id_cine = BigInt(query.id_cine);
    }
    if (query.id_tipo_asiento !== undefined) {
      where.id_tipo_asiento = BigInt(query.id_tipo_asiento);
    }

    const precios = await this.prisma.preciosCine.findMany({
      where,
      include: {
        cines: { select: { id: true, nombre: true } },
        tipoAsiento: { select: { id: true, nombre: true } },
      },
      orderBy: [{ id_cine: 'asc' }, { id_tipo_asiento: 'asc' }],
    });

    return precios.map((p) => this.toResponse(p));
  }

  async findOne(id: string) {
    const precioId = this.parseId(id);
    const precio = await this.prisma.preciosCine.findUnique({
      where: { id: precioId },
      include: {
        cines: { select: { id: true, nombre: true } },
        tipoAsiento: { select: { id: true, nombre: true } },
      },
    });
    if (!precio) {
      throw new NotFoundException('Precio no encontrado');
    }
    return this.toResponse(precio);
  }

  async create(dto: CreatePrecioCineDto, auditorId: bigint) {
    const idCine = BigInt(dto.id_cine);
    const idTipo = BigInt(dto.id_tipo_asiento);

    const cine = await this.prisma.cines.findUnique({
      where: { id: idCine },
      select: { id: true },
    });
    if (!cine) {
      throw new BadRequestException('Cine no existe');
    }

    const tipo = await this.prisma.tiposAsiento.findUnique({
      where: { id: idTipo },
      select: { id: true },
    });
    if (!tipo) {
      throw new BadRequestException('Tipo de asiento no existe');
    }

    const duplicado = await this.prisma.preciosCine.findUnique({
      where: {
        id_cine_id_tipo_asiento: {
          id_cine: idCine,
          id_tipo_asiento: idTipo,
        },
      },
      select: { id: true },
    });
    if (duplicado) {
      throw new ConflictException(
        'Ya existe un precio para ese cine y tipo de asiento',
      );
    }

    const precio = await this.prisma.preciosCine.create({
      data: {
        id_cine: idCine,
        id_tipo_asiento: idTipo,
        precio: new Prisma.Decimal(dto.precio),
      },
      include: {
        cines: { select: { id: true, nombre: true } },
        tipoAsiento: { select: { id: true, nombre: true } },
      },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'PRECIO_CREAR',
      entidad: 'PrecioCine',
      entidad_id: precio.id,
      detalle: `Precio ${precio.id.toString()} creado para ${precio.cines.nombre} / ${precio.tipoAsiento.nombre}`,
      valor_nuevo: snapshotPrecioCine(precio),
    });

    return this.toResponse(precio);
  }

  async update(id: string, dto: UpdatePrecioCineDto, auditorId: bigint) {
    const precioId = this.parseId(id);
    const prev = await this.prisma.preciosCine.findUnique({
      where: { id: precioId },
      include: {
        cines: { select: { id: true, nombre: true } },
        tipoAsiento: { select: { id: true, nombre: true } },
      },
    });
    if (!prev) {
      throw new NotFoundException('Precio no encontrado');
    }

    const precio = await this.prisma.preciosCine.update({
      where: { id: precioId },
      data: { precio: new Prisma.Decimal(dto.precio) },
      include: {
        cines: { select: { id: true, nombre: true } },
        tipoAsiento: { select: { id: true, nombre: true } },
      },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'PRECIO_EDITAR',
      entidad: 'PrecioCine',
      entidad_id: precio.id,
      detalle: `Precio ${precio.id.toString()} (${precio.cines.nombre} / ${precio.tipoAsiento.nombre}) actualizado`,
      valor_anterior: snapshotPrecioCine(prev),
      valor_nuevo: snapshotPrecioCine(precio),
    });

    return this.toResponse(precio);
  }

  async remove(id: string, auditorId: bigint) {
    const precioId = this.parseId(id);
    const existing = await this.prisma.preciosCine.findUnique({
      where: { id: precioId },
      include: {
        cines: { select: { id: true, nombre: true } },
        tipoAsiento: { select: { id: true, nombre: true } },
      },
    });
    if (!existing) {
      throw new NotFoundException('Precio no encontrado');
    }

    await this.prisma.preciosCine.delete({ where: { id: precioId } });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'PRECIO_ELIMINAR',
      entidad: 'PrecioCine',
      entidad_id: precioId,
      detalle: `Precio ${precioId.toString()} (${existing.cines.nombre} / ${existing.tipoAsiento.nombre}) eliminado`,
      valor_anterior: snapshotPrecioCine(existing),
    });

    return { id: precioId.toString() };
  }

  private toResponse(p: PrecioCinePayload) {
    return {
      id: p.id.toString(),
      precio: p.precio.toFixed(2),
      cine: {
        id: p.cines.id.toString(),
        nombre: p.cines.nombre,
      },
      tipo_asiento: {
        id: p.tipoAsiento.id.toString(),
        nombre: p.tipoAsiento.nombre,
      },
    };
  }

  private parseId(id: string): bigint {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException('ID inválido');
    }
  }
}
