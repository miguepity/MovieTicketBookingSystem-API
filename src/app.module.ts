import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CineModule } from './modules/cine/cine.module';
import { CiudadesModule } from './modules/ciudades/ciudades.module';
import { PeliculaModule } from './modules/pelicula/pelicula.module';
import { UsersModule } from './modules/users/users.module';
import { SalasModule } from './modules/salas/salas.module';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { GenerosModule } from './modules/generos/generos.module';
import { IdiomasModule } from './modules/idiomas/idiomas.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    CineModule,
    CiudadesModule,
    PeliculaModule,
    SalasModule,
    AuthModule,
    UsersModule,
    GenerosModule,
    IdiomasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
