import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CiudadesModule } from './ciudades/ciudad.module';
import { CinesModule } from './cines/cine.module';
import { RolesModule } from './roles/roles.module';
import { GenerosModule } from './generos/generos.module';
import { IdiomasModule } from './idiomas/idiomas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CiudadesModule,
    CinesModule,
    RolesModule,
    GenerosModule,
    IdiomasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
