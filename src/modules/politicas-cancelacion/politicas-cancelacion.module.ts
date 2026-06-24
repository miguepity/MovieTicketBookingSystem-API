import { Module } from '@nestjs/common';
import { PoliticasCancelacionService } from './politicas-cancelacion.service';
import { PoliticasCancelacionController } from './politicas-cancelacion.controller';
import { ReglasPoliticaController } from './reglas-politica.controller';

@Module({
  controllers: [PoliticasCancelacionController, ReglasPoliticaController],
  providers: [PoliticasCancelacionService],
})
export class PoliticasCancelacionModule {}
