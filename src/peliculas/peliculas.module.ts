import { Module } from '@nestjs/common';
import { PeliculasController } from './peliculas.controller';
import { PeliculasService } from './peliculas.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [PeliculasController],
  providers: [PeliculasService],
})
export class PeliculasModule {}
