import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CiudadesModule } from './ciudades/ciudad.module';
import { CinesModule } from './cines/cine.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CiudadesModule,
    CinesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
