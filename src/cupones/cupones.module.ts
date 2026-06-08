import { Module } from '@nestjs/common';
import { CuponesService } from './cupones.service';
import { CuponesController } from './cupones.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CuponesController],
  providers: [CuponesService, PrismaService],
  exports: [CuponesService],
})
export class CuponesModule {}
