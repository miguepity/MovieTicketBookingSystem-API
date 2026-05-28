import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PeliculasModule } from './peliculas/peliculas.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PeliculasModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
