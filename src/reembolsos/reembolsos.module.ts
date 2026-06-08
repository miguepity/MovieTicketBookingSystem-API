import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReembolsosController } from './reembolsos.controller';
import { ReembolsosService } from './reembolsos.service';

@Module({
    imports: [PrismaModule],
    controllers: [ReembolsosController],
    providers: [ReembolsosService],
})
export class ReembolsosModule { }
