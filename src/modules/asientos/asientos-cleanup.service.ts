import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AsientosService } from './asientos.service';

@Injectable()
export class AsientosCleanupService {
  private readonly logger = new Logger(AsientosCleanupService.name);

  constructor(private readonly asientosService: AsientosService) {}

  // Cada 30s libera asientos cuyo bloqueado_hasta ya pasó
  @Cron(CronExpression.EVERY_30_SECONDS)
  async run() {
    await this.asientosService.liberarExpirados();
  }
}
