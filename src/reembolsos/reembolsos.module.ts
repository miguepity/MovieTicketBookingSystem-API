import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReembolsosController } from './reembolsos.controller';
import { ReembolsosService } from './reembolsos.service';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PrismaModule, MailModule, AuthModule],
    controllers: [ReembolsosController],
    providers: [ReembolsosService],
})
export class ReembolsosModule { }
