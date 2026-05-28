import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CiudadesModule } from './ciudades/ciudades.module';
import { SalasModule } from './modules/salas/salas.module';

@Module({
  imports: [PrismaModule, CiudadesModule, SalasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
