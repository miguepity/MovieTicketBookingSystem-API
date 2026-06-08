import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controllers';

@Module({
  imports: [PrismaModule],
  providers: [UsuariosService],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
