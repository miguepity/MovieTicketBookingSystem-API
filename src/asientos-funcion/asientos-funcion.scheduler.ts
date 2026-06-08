import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AsientosFuncionScheduler {
  private readonly logger = new Logger(AsientosFuncionScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async liberarAsientosExpirados() {
    const ahora = new Date();

    const resultado = await this.prisma.asientosFuncion.updateMany({
      where: {
        estado: 'bloqueado',
        bloqueado_hasta: { lt: ahora },
      },
      data: {
        estado: 'disponible',
        id_usuario: null,
      },
    });

    if (resultado.count > 0) {
      this.logger.log(
        `✅ ${resultado.count} asiento(s) liberados automáticamente`,
      );
    }
  }
}
