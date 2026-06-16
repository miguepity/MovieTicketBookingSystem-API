import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
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
import { RolesModule } from './modules/roles/roles.module';
import { AsientosModule } from './modules/asientos/asientos.module';
import { ReservasModule } from './modules/reservas/reservas.module';
import { PagosModule } from './modules/pagos/pagos.module';
import { ReembolsosModule } from './modules/reembolsos/reembolsos.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { PoliticasCancelacionModule } from './modules/politicas-cancelacion/politicas-cancelacion.module';
import { TiposAsientoModule } from './modules/tipos-asiento/tipos-asiento.module';
import { PreciosCineModule } from './modules/precios-cine/precios-cine.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { FuncionesModule } from './modules/funciones/funciones.module';
import { CuponesModule } from './modules/cupones/cupones.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuditLogModule,
    MailModule,
    CineModule,
    CiudadesModule,
    PeliculaModule,
    SalasModule,
    AuthModule,
    UsersModule,
    GenerosModule,
    IdiomasModule,
    RolesModule,
    AsientosModule,
    ReservasModule,
    PagosModule,
    ReembolsosModule,
    NotificacionesModule,
    PoliticasCancelacionModule,
    TiposAsientoModule,
    PreciosCineModule,
    ReportesModule,
    FuncionesModule,
    CuponesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
