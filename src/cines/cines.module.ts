import { Module } from '@nestjs/common';
import { CinesService } from './cines.service';
import { CinesController } from './cines.controller';

@Module({
  controllers: [CinesController],
  providers: [CinesService],
})
export class CinesModule {}
