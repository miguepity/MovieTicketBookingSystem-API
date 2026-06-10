import { Module } from '@nestjs/common';
import { CinesController } from './cines.controller';
import { CinesService } from './cines.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CinesController],
  providers: [CinesService],
})
export class CinesModule {}
