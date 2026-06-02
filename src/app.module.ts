import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PeliculasModule } from './peliculas/peliculas.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PasswordResetTokenModule } from './password reset/passwordresetmodule';
import { GenerosModule } from './generos/generos.module';
@Module({
  imports: [
    PasswordResetTokenModule,
    PrismaModule,
    AuthModule,
    PeliculasModule,
    GenerosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
