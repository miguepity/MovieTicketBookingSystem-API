import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CuponesService } from './cupones.service';
import { CuponesController } from './cupones.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CuponesController],
  providers: [CuponesService],
})
export class CuponesModule {}
