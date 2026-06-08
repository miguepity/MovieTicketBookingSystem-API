import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { PeliculasModule } from './peliculas/peliculas.module';
import { PrismaModule } from './prisma/prisma.module';
import { CiudadesModule } from './ciudades/ciudades.module';
import { FuncionesModule } from './funciones/funciones.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PeliculasModule,
    PrismaModule,
    CiudadesModule,
    FuncionesModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
