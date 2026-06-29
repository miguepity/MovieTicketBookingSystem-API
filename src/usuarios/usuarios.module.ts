import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from 'src/audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  providers: [UsuariosService],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
