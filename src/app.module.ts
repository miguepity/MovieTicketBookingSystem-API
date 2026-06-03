import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PeliculasModule } from './peliculas/peliculas.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PasswordResetTokenModule } from './password reset/passwordresetmodule';
import { CiudadesModule } from './ciudades/ciudades.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { GenerosModule } from './generos/generos.module';
import { CuponesModule } from './cupones/cupones.module';

@Module({
  imports: [
    PasswordResetTokenModule,
    PrismaModule,
    AuthModule,
    UsuariosModule,
    PeliculasModule,
    CiudadesModule,
    GenerosModule,
    CuponesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
