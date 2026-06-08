import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controllers';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [UsuariosService],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
