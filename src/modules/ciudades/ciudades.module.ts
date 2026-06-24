import { Module } from '@nestjs/common';
import { CiudadesService } from './ciudades.service';
import { CiudadesController, CiudadesDeprecatedController } from './ciudades.controller';

@Module({
  controllers: [CiudadesController, CiudadesDeprecatedController],
  providers: [CiudadesService],
})
export class CiudadesModule {}
