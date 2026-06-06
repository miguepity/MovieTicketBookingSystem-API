import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    JwtModule.register({
      global: true, // Hace que el JwtService esté disponible en toda la aplicación sin volver a importarlo
      secret: process.env.JWT_SECRET || 'super-secret-key-change-me', // TODO: Agregar JWT_SECRET a .env
      signOptions: { expiresIn: '1d' }, // El token expirará en 1 día
    }),
  ],
})
export class AuthModule {}
