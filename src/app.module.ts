import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PeliculasModule } from './peliculas/peliculas.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PasswordResetTokenModule } from './password reset/passwordreset.module';
import { CiudadesModule } from './ciudades/ciudades.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { GenerosModule } from './generos/generos.module';
import { IdiomasModule } from './idiomas/idiomas.module';
import { RolesModule } from './roles/roles.module';
import { CineModule } from './cines/cines.module';
import { CuponesModule } from './cupones/cupones.module';
import { FuncionesModule } from './funciones/funciones.module';
import { SalaModule } from './salas/salas.module';
import { PoliticasCancelacionModule } from './politicas de cancelacion/politicas.cancelacion.module';
import { ReembolsosModule } from './reembolsos/reembolsos.module';
import { ReservasModule } from './reservas/reservas.module';
import { AsientosModule } from './asientos/asientos.module';

@Module({
  imports: [
    PasswordResetTokenModule,
    PrismaModule,
    AuthModule,
    UsuariosModule,
    PeliculasModule,
    CiudadesModule,
    GenerosModule,
    IdiomasModule,
    RolesModule,
    CineModule,
    CuponesModule,
    SalaModule,
    FuncionesModule,
    PoliticasCancelacionModule,
    ReembolsosModule,
    FuncionesModule,
    SalaModule,
    ReservasModule,
    AsientosModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
