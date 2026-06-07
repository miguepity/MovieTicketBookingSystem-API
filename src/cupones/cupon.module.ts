import { Module } from '@nestjs/common';
import { CuponesService } from './cupon.service';
import { CuponesController } from './cupon.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CuponesController],
  providers: [CuponesService],
})
export class CuponesModule {}