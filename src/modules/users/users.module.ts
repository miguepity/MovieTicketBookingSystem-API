import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminClientesController } from './admin-clientes.controller';
import { AdminStaffController } from './admin-staff.controller';
import { MePerfilController } from './me-perfil.controller';

@Module({
  controllers: [
    UsersController,
    AdminClientesController,
    AdminStaffController,
    MePerfilController,
  ],
  providers: [UsersService],
})
export class UsersModule {}
