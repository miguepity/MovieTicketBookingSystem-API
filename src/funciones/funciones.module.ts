import { Module } from '@nestjs/common';
import { FuncionesService } from './funciones.service';
import { FuncionesController } from './funciones.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, AuthModule, MailModule],
  controllers: [FuncionesController],
  providers: [FuncionesService],
})
export class FuncionesModule {}
