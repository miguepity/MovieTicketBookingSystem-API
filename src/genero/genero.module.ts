import { Module } from '@nestjs/common';
import { GeneroController } from './genero.controller';
import { GeneroService } from './genero.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [GeneroController],
  providers: [GeneroService],
  imports: [PrismaModule],
})
export class GeneroModule {}
