import { Module } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';

@Module({
  imports: [PrismaModule, AuthModule, MailModule, ReembolsosModule],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}
