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
import { GuardarMatrizDto } from './dto/guardar-matriz.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { snapshotPrecioCine } from '../audit-log/snapshots';

type PrecioCinePayload = Prisma.PreciosCineGetPayload<{
  include: {
    cine: { select: { id: true; nombre: true } };
    tipo_asiento: { select: { id: true; nombre: true } };
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
        cine: { select: { id: true, nombre: true } },
        tipo_asiento: { select: { id: true, nombre: true } },
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
        cine: { select: { id: true, nombre: true } },
        tipo_asiento: { select: { id: true, nombre: true } },
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
        cine: { select: { id: true, nombre: true } },
        tipo_asiento: { select: { id: true, nombre: true } },
      },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'PRECIO_CREAR',
      entidad: 'PrecioCine',
      entidad_id: precio.id,
      detalle: `Precio ${precio.id.toString()} creado para ${precio.cine?.nombre} / ${precio.tipo_asiento.nombre}`,
      valor_nuevo: snapshotPrecioCine(precio),
    });

    return this.toResponse(precio);
  }

  async update(id: string, dto: UpdatePrecioCineDto, auditorId: bigint) {
    const precioId = this.parseId(id);
    const prev = await this.prisma.preciosCine.findUnique({
      where: { id: precioId },
      include: {
        cine: { select: { id: true, nombre: true } },
        tipo_asiento: { select: { id: true, nombre: true } },
      },
    });
    if (!prev) {
      throw new NotFoundException('Precio no encontrado');
    }

    const precio = await this.prisma.preciosCine.update({
      where: { id: precioId },
      data: { precio: new Prisma.Decimal(dto.precio) },
      include: {
        cine: { select: { id: true, nombre: true } },
        tipo_asiento: { select: { id: true, nombre: true } },
      },
    });

    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'PRECIO_EDITAR',
      entidad: 'PrecioCine',
      entidad_id: precio.id,
      detalle: `Precio ${precio.id.toString()} (${precio.cine?.nombre} / ${precio.tipo_asiento.nombre}) actualizado`,
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
        cine: { select: { id: true, nombre: true } },
        tipo_asiento: { select: { id: true, nombre: true } },
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
      detalle: `Precio ${precioId.toString()} (${existing.cine?.nombre} / ${existing.tipo_asiento.nombre}) eliminado`,
      valor_anterior: snapshotPrecioCine(existing),
    });

    return { id: precioId.toString() };
  }

  async getMatriz() {
    const [tipos, cines, precios] = await Promise.all([
      this.prisma.tiposAsiento.findMany({ orderBy: { nombre: 'asc' } }),
      this.prisma.cines.findMany({
        include: { ciudades: true },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.preciosCine.findMany(),
    ]);

    const defaults: Record<string, number> = {};
    const byCine: Record<string, Record<string, number>> = {};

    for (const p of precios) {
      const key = String(p.id_tipo_asiento);
      if (p.id_cine == null) {
        defaults[key] = Number(p.precio);
      } else {
        const k = String(p.id_cine);
        if (!byCine[k]) byCine[k] = {};
        byCine[k][key] = Number(p.precio);
      }
    }

    return {
      tipos_asiento: tipos.map((t) => ({
        id: String(t.id),
        nombre: t.nombre,
        color: (t as any).color ?? null,
      })),
      defaults,
      cines: cines.map((c) => ({
        id: String(c.id),
        nombre: c.nombre,
        ciudad: c.ciudades?.nombre ?? null,
        precios: byCine[String(c.id)] ?? {},
      })),
    };
  }

  async guardarMatriz(dto: GuardarMatrizDto, auditorId: bigint) {
    // Validate all precio values
    const allEntries: Array<[string, number | null]> = [
      ...Object.entries(dto.defaults ?? {}),
      ...(dto.cines ?? []).flatMap((c) => Object.entries(c.precios ?? {})),
    ];
    for (const [key, val] of allEntries) {
      if (val !== null && (typeof val !== 'number' || val <= 0)) {
        throw new BadRequestException(
          `Precio inválido para tipo ${key}: debe ser un número positivo o null`,
        );
      }
    }

    // Validate all tipo_asiento ids exist (skip non-numeric keys like read-only fields)
    const allTipoIds = new Set([
      ...Object.keys(dto.defaults ?? {}),
      ...(dto.cines ?? []).flatMap((c) => Object.keys(c.precios ?? {})),
    ]);
    const numericTipoIds = new Set(
      Array.from(allTipoIds).filter((id) => /^\d+$/.test(id)),
    );
    if (numericTipoIds.size > 0) {
      const tiposEnDB = await this.prisma.tiposAsiento.findMany({
        where: { id: { in: Array.from(numericTipoIds).map((id) => BigInt(id)) } },
        select: { id: true },
      });
      const idsEnDB = new Set(tiposEnDB.map((t) => String(t.id)));
      for (const id of numericTipoIds) {
        if (!idsEnDB.has(id)) {
          throw new BadRequestException(
            `Tipo de asiento desconocido: ${id}`,
          );
        }
      }
    }

    await this.prisma.$transaction(async (tx) => {
      // Handle defaults using findFirst + update/create/delete (partial index)
      for (const [tipoId, precio] of Object.entries(dto.defaults ?? {})) {
        const existing = await tx.preciosCine.findFirst({
          where: { id_cine: null, id_tipo_asiento: BigInt(tipoId) },
        });
        if (precio === null) {
          if (existing) {
            await tx.preciosCine.delete({ where: { id: existing.id } });
          }
        } else if (existing) {
          await tx.preciosCine.update({
            where: { id: existing.id },
            data: { precio: new Prisma.Decimal(precio) },
          });
        } else {
          await tx.preciosCine.create({
            data: {
              id_cine: null,
              id_tipo_asiento: BigInt(tipoId),
              precio: new Prisma.Decimal(precio),
            },
          });
        }
      }

      // Handle per-cine rows using compound unique upsert
      for (const c of dto.cines ?? []) {
        const cineId = c.id_cine ?? c.id;
        if (!cineId) {
          throw new BadRequestException('cine sin id_cine');
        }
        for (const [tipoId, precio] of Object.entries(c.precios ?? {})) {
          if (precio === null) {
            await tx.preciosCine.deleteMany({
              where: {
                id_cine: BigInt(cineId),
                id_tipo_asiento: BigInt(tipoId),
              },
            });
          } else {
            await tx.preciosCine.upsert({
              where: {
                id_cine_id_tipo_asiento: {
                  id_cine: BigInt(cineId),
                  id_tipo_asiento: BigInt(tipoId),
                },
              },
              create: {
                id_cine: BigInt(cineId),
                id_tipo_asiento: BigInt(tipoId),
                precio: new Prisma.Decimal(precio),
              },
              update: { precio: new Prisma.Decimal(precio) },
            });
          }
        }
      }
    });

    // Audit after transaction commits
    await this.auditLog.registrar({
      id_usuario: auditorId,
      id_auditor: auditorId,
      accion: 'PRECIOS_MATRIZ_ACTUALIZAR',
      entidad: 'precios',
      detalle: 'Matriz de precios actualizada',
      valor_nuevo: dto as unknown as Prisma.InputJsonValue,
    });

    return this.getMatriz();
  }

  async findByCine(idCine: bigint) {
    return this.prisma.preciosCine.findMany({
      where: { id_cine: idCine },
      include: { tipo_asiento: true },
    });
  }

  private toResponse(p: PrecioCinePayload) {
    return {
      id: p.id.toString(),
      precio: p.precio.toFixed(2),
      cine: p.cine
        ? { id: p.cine.id.toString(), nombre: p.cine.nombre }
        : null,
      tipo_asiento: {
        id: p.tipo_asiento.id.toString(),
        nombre: p.tipo_asiento.nombre,
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
