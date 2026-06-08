import { Module } from '@nestjs/common';
import { FuncionesController } from './funciones.controller';
import { FuncionesService } from './funciones.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [FuncionesController],
  providers: [FuncionesService],
})
export class FuncionesModule {}
