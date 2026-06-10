import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [PagosService],
  controllers: [PagosController],
  imports: [PrismaModule],
})
export class PagosModule {}
