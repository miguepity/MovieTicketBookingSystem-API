import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BoletosController } from './boletos.controller';
import { BoletoCodeService } from './boleto-code.service';
import { BoletosPdfService } from './boletos-pdf.service';

@Module({
  imports: [PrismaModule],
  controllers: [BoletosController],
  providers: [BoletoCodeService, BoletosPdfService],
  exports: [BoletoCodeService, BoletosPdfService],
})
export class BoletosModule {}
