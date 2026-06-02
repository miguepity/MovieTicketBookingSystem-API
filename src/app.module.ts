import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CineModule } from './cine/cine.module';
import { CiudadesModule } from './ciudades/ciudades.module';
import { PeliculaModule } from './pelicula/pelicula.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, CineModule, CiudadesModule, PeliculaModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
