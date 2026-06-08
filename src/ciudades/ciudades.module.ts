import { Module } from '@nestjs/common';
import { CiudadesService } from './ciudades.service';
import { CiudadesController } from './ciudades.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CiudadesController],
  providers: [CiudadesService, PrismaService],
})
export class CiudadesModule {}
