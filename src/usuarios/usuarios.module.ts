import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [UsuariosService],
  controllers: [UsuariosController],
  imports: [JwtModule],
})
export class UsuariosModule {}
