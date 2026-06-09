import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registrar(params: {
    id_usuario: bigint;
    id_auditor: bigint;
    accion: string;
    detalle?: string;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          id_usuario: params.id_usuario,
          id_auditor: params.id_auditor,
          accion: params.accion,
          detalle: params.detalle,
        },
      });
    } catch (error) {
      this.logger.error(
        `Falló registro de auditoría (accion=${params.accion})`,
        error,
      );
    }
  }
}
