import { Module } from '@nestjs/common';
import { ReembolsosController } from './reembolsos.controller';
import { ReembolsosService } from './reembolsos.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ReembolsosController],
  providers: [ReembolsosService],
  imports: [PrismaModule],
})
export class ReembolsosModule {}
