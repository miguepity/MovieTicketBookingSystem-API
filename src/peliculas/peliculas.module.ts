import { Module } from '@nestjs/common';
import { PeliculasController } from './peliculas.controller.js';
import { PeliculasService } from './peliculas.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { R2Service } from './r2.service.js';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [PrismaModule, AuthModule, MailModule],
  controllers: [PeliculasController],
  providers: [PeliculasService, R2Service],
})
export class PeliculasModule {}
