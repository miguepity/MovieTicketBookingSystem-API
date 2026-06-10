import { Module } from '@nestjs/common';
import { IdiomasController } from './idiomas.controller';
import { IdiomasService } from './idiomas.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [IdiomasController],
  providers: [IdiomasService],
  imports: [PrismaModule],
})
export class IdiomasModule {}
