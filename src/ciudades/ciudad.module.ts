import { Module } from '@nestjs/common';
import { CiudadesService } from './ciudad.service';
import { CiudadesController } from './ciudad.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CiudadesController],
  providers: [CiudadesService],
})
export class CiudadesModule {}