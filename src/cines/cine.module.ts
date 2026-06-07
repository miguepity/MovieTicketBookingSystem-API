import { Module } from '@nestjs/common';
import { CinesService } from './cine.service';
import { CinesController } from './cine.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CinesController],
  providers: [CinesService],
})
export class CinesModule {}