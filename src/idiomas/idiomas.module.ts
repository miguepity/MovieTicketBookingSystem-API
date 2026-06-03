import { Module } from '@nestjs/common';
import { IdiomasService } from './idiomas.service';
import { IdiomasController } from './idiomas.controller';

@Module({
  controllers: [IdiomasController],
  providers: [IdiomasService],
})
export class IdiomasModule {}
