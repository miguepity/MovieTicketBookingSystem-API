import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { PeliculasModule } from './peliculas/peliculas.module';

@Module({
  imports: [AuthModule, UsersModule, PeliculasModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
