import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './admin/users/users.module.js';
import { PeliculasModule } from './peliculas/peliculas.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { SalaModule } from './sala/sala.module';
import { CiudadesModule } from './ciudades/ciudad.module';
import { CinesModule } from './cines/cine.module';
import { RolesModule } from './roles/roles.module';
import { GenerosModule } from './generos/generos.module';
import { IdiomasModule } from './idiomas/idiomas.module';
import { PoliticasCancelacionModule } from './politicas_cancelacion/politicas_cancelacion.module';
import { FuncionesModule } from './funciones/funciones.module';
import { CuponesModule } from './cupones/cupon.module';
import { ReservasModule } from './reservas/reservas.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PeliculasModule,
    SalaModule,
    CiudadesModule,
    CinesModule,
    RolesModule,
    GenerosModule,
    IdiomasModule,
    PoliticasCancelacionModule,
    FuncionesModule,
    CuponesModule,
    ReservasModule,
    UsuariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
