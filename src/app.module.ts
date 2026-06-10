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
import { MailModule } from './mail/mail.module';
import { CuponesModule } from './cupones/cupones.module';
import { PoliticaCancelacionModule } from './politica-cancelacion/politica-cancelacion.module';
import { SalasModule } from './salas/salas.module';
import { CinesModule } from './cines/cines.module';
import { PagosModule } from './pagos/pagos.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReservasModule } from './reservas/reservas.module';
import { GeneroModule } from './genero/genero.module';
import { IdiomasModule } from './idiomas/idiomas.module';

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    PeliculasModule,
    PrismaModule,
    CiudadesModule,
    FuncionesModule,
    RolesModule,
    MailModule,
    CuponesModule,
    PoliticaCancelacionModule,
    SalasModule,
    CinesModule,
    PagosModule,
    ReservasModule,
    GeneroModule,
    IdiomasModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
