import { Module } from '@nestjs/common';
import { CinesController } from './cines.controller';
import { CinesService } from './cines.service';

@Module({
  controllers: [CinesController],
  providers: [CinesService]
})
export class CinesModule {}
