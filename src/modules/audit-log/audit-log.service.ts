import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogDetailResponseDto } from './dto/audit-log-detail.response.dto';
import { AuditLogListResponseDto } from './dto/audit-log-item.response.dto';
import { ListAuditLogQueryDto } from './dto/list-audit-log.query.dto';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registrar(params: {
    id_usuario: bigint;
    id_auditor: bigint;
    accion: string;
    detalle?: string;
    entidad?: string;
    entidad_id?: bigint;
    valor_anterior?: Prisma.InputJsonValue;
    valor_nuevo?: Prisma.InputJsonValue;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          id_usuario: params.id_usuario,
          id_auditor: params.id_auditor,
          accion: params.accion,
          detalle: params.detalle,
          entidad: params.entidad,
          entidad_id: params.entidad_id,
          valor_anterior: params.valor_anterior,
          valor_nuevo: params.valor_nuevo,
        },
      });
    } catch (error) {
      this.logger.error(
        `Falló registro de auditoría (accion=${params.accion})`,
        error,
      );
    }
  }

  async list(q: ListAuditLogQueryDto): Promise<AuditLogListResponseDto> {
    const where: Prisma.AuditLogWhereInput = {};
    if (q.accion?.length) where.accion = { in: q.accion };
    if (q.entidad) where.entidad = q.entidad;
    if (q.entidad_id) where.entidad_id = BigInt(q.entidad_id);
    if (q.id_auditor) where.id_auditor = BigInt(q.id_auditor);
    if (q.fecha_desde || q.fecha_hasta) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (q.fecha_desde) createdAt.gte = new Date(q.fecha_desde);
      if (q.fecha_hasta) {
        const fin = new Date(q.fecha_hasta);
        fin.setUTCHours(23, 59, 59, 999);
        createdAt.lte = fin;
      }
      where.created_at = createdAt;
    }

    const page = q.page ?? 1;
    const page_size = q.page_size ?? 20;

    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        take: page_size,
        skip: (page - 1) * page_size,
        orderBy: { created_at: 'desc' },
        include: {
          realizado_por: { select: { id: true, nombre: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items: rows.map((r) => ({
        id: r.id.toString(),
        created_at: r.created_at.toISOString(),
        accion: r.accion,
        detalle: r.detalle,
        entidad: r.entidad,
        entidad_id: r.entidad_id?.toString() ?? null,
        auditor: {
          id: r.realizado_por.id.toString(),
          nombre: r.realizado_por.nombre,
          email: r.realizado_por.email,
        },
        tiene_snapshot: r.valor_anterior !== null || r.valor_nuevo !== null,
      })),
      total,
      page,
      page_size,
    };
  }

  async getById(id: string): Promise<AuditLogDetailResponseDto> {
    const row = await this.prisma.auditLog.findUnique({
      where: { id: BigInt(id) },
      include: {
        realizado_por: { select: { id: true, nombre: true, email: true } },
      },
    });
    if (!row) throw new NotFoundException(`AuditLog ${id} no encontrado`);
    return {
      id: row.id.toString(),
      created_at: row.created_at.toISOString(),
      accion: row.accion,
      detalle: row.detalle,
      entidad: row.entidad,
      entidad_id: row.entidad_id?.toString() ?? null,
      auditor: {
        id: row.realizado_por.id.toString(),
        nombre: row.realizado_por.nombre,
        email: row.realizado_por.email,
      },
      valor_anterior: row.valor_anterior as object | null,
      valor_nuevo: row.valor_nuevo as object | null,
    };
  }
}
