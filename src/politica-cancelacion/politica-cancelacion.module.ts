import { Module } from '@nestjs/common';
import { PoliticaCancelacionService } from './politica-cancelacion.service';
import { PoliticaCancelacionController } from './politica-cancelacion.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PoliticaCancelacionController],
  providers: [PoliticaCancelacionService],
})
export class PoliticaCancelacionModule {}
