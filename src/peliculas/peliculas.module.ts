import { Module } from '@nestjs/common';
import { PeliculasController } from './peliculas.controller.js';
import { PeliculasService } from './peliculas.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { R2Service } from './r2.service.js';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PeliculasController],
  providers: [PeliculasService, R2Service],
})
export class PeliculasModule {}
