import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  create(createAuditLogDto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        id_usuario: createAuditLogDto.id_usuario,
        id_auditor: createAuditLogDto.id_auditor,
        accion: createAuditLogDto.accion,
        detalle: createAuditLogDto.detalle,
      },
    });
  }

  findAll() {
    return this.prisma.auditLog.findMany({
      include: {
        usuarios: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        realizado_por: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        usuarios: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        realizado_por: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });
  }

  update(id: number, updateAuditLogDto: UpdateAuditLogDto) {
    return this.prisma.auditLog.update({
      where: { id },
      data: updateAuditLogDto,
    });
  }

  remove(id: number) {
    return this.prisma.auditLog.delete({
      where: { id },
    });
  }
}
