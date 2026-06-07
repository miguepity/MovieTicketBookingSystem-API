import { Module } from '@nestjs/common';
import { PeliculasController } from './peliculas.controller.js';
import { PeliculasService } from './peliculas.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PeliculasController],
  providers: [PeliculasService],
})
export class PeliculasModule {}
