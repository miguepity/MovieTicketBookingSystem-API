import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from './auth.service';

@Injectable()
export class JwtBlacklistCleanupService {
  private readonly logger = new Logger(JwtBlacklistCleanupService.name);

  constructor(private readonly authService: AuthService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async run() {
    const eliminados = await this.authService.limpiarBlacklistExpirada();
    if (eliminados > 0) {
      this.logger.log(`Blacklist limpiada: ${eliminados} tokens expirados`);
    }
  }
}
