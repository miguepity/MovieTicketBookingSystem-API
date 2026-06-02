import { Module } from '@nestjs/common';
import { CineService } from './cine.service';
import { CineController } from './cine.controller';

@Module({
  controllers: [CineController],
  providers: [CineService],
})
export class CineModule {}
