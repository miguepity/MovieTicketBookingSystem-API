import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

const userSelect = { select: { id: true, nombre: true, email: true } };

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async logAction(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        id_usuario: BigInt(dto.id_usuario),
        id_auditor: BigInt(dto.id_auditor),
        accion: dto.accion,
        detalle: dto.detalle,
      },
    });
  }

  async findFiltered(dto: QueryAuditLogDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 20;

    const where: Prisma.AuditLogWhereInput = {
      ...(dto.id_usuario && { id_usuario: BigInt(dto.id_usuario) }),
      ...(dto.id_auditor && { id_auditor: BigInt(dto.id_auditor) }),
      ...(dto.accion && {
        accion: { contains: dto.accion, mode: 'insensitive' },
      }),
      ...((dto.fecha_inicio || dto.fecha_final) && {
        created_at: {
          ...(dto.fecha_inicio && { gte: new Date(dto.fecha_inicio) }),
          ...(dto.fecha_final && {
            lte: new Date(dto.fecha_final + 'T23:59:59Z'),
          }),
        },
      }),
      ...(dto.q && {
        OR: [
          { usuarios: { nombre: { contains: dto.q, mode: 'insensitive' } } },
          { usuarios: { email: { contains: dto.q, mode: 'insensitive' } } },
          {
            realizado_por: { nombre: { contains: dto.q, mode: 'insensitive' } },
          },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { usuarios: userSelect, realizado_por: userSelect },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: data.map((log) => ({
        ...log,
        id: log.id.toString(),
        id_usuario: log.id_usuario.toString(),
        id_auditor: log.id_auditor.toString(),
        usuarios: { ...log.usuarios, id: log.usuarios.id.toString() },
        realizado_por: {
          ...log.realizado_por,
          id: log.realizado_por.id.toString(),
        },
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Kept for internal/Swagger use
  create(dto: CreateAuditLogDto) {
    return this.logAction(dto);
  }
}
