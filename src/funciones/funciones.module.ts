import { Module } from '@nestjs/common';
import { FuncionesService } from './funciones.service';
import { FuncionesController } from './funciones.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FuncionesController],
  providers: [FuncionesService, PrismaService],
})
export class FuncionesModule {}
