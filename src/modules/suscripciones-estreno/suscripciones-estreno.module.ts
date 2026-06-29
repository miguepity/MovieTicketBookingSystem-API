import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SuscripcionesEstrenoController } from './suscripciones-estreno.controller';
import { SuscripcionesEstrenoService } from './suscripciones-estreno.service';

@Module({
  imports: [PrismaModule],
  controllers: [SuscripcionesEstrenoController],
  providers: [SuscripcionesEstrenoService],
  exports: [SuscripcionesEstrenoService],
})
export class SuscripcionesEstrenoModule {}
