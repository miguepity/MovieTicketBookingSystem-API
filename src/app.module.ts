import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CineModule } from './cine/cine.module';
import { CiudadesModule } from './ciudades/ciudades.module';
import { PeliculaModule } from './pelicula/pelicula.module';
import { SalasModule } from './modules/salas/salas.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    CineModule,
    CiudadesModule,
    PeliculaModule,
    SalasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
