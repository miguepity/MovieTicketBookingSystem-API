import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeLog(log: any) {
    return {
      id: Number(log.id),
      accion: log.accion,
      detalle: log.detalle,
      created_at: log.created_at,
      usuario: log.usuarios
        ? {
            id: Number(log.usuarios.id),
            nombre: log.usuarios.nombre,
            email: log.usuarios.email,
          }
        : null,
      auditor: log.realizado_por
        ? {
            id: Number(log.realizado_por.id),
            nombre: log.realizado_por.nombre,
            email: log.realizado_por.email,
          }
        : null,
    };
  }

  async findAll(query: QueryAuditLogsDto) {
    const { accion, id_usuario, id_auditor, desde, hasta } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = {};

    if (accion) {
      where.accion = { contains: accion, mode: 'insensitive' };
    }

    if (id_usuario) {
      where.id_usuario = BigInt(id_usuario);
    }

    if (id_auditor) {
      where.id_auditor = BigInt(id_auditor);
    }

    if (desde || hasta) {
      where.created_at = {};
      if (desde) where.created_at.gte = new Date(desde);
      if (hasta) where.created_at.lte = new Date(hasta);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          usuarios: { select: { id: true, nombre: true, email: true } },
          realizado_por: { select: { id: true, nombre: true, email: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((log) => this.serializeLog(log)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id: BigInt(id) },
      include: {
        usuarios: { select: { id: true, nombre: true, email: true } },
        realizado_por: { select: { id: true, nombre: true, email: true } },
      },
    });

    if (!log) {
      throw new NotFoundException(`El audit log con ID ${id} no existe`);
    }

    return this.serializeLog(log);
  }
}
