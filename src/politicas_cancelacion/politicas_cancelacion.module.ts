import { Module } from '@nestjs/common';
import { PoliticasCancelacionService } from './politicas_cancelacion.service';
import { PoliticasCancelacionController } from './politicas_cancelacion.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PoliticasCancelacionController],
  providers: [PoliticasCancelacionService],
})
export class PoliticasCancelacionModule {}
