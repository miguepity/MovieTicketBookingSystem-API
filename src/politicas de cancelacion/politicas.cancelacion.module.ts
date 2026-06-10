import { Module } from '@nestjs/common';
import { PoliticasCancelacionController } from './politicas.cancelacion.controller';
import { PoliticasCancelacionService } from './politicas.cancelacion.service';

@Module({
  controllers: [PoliticasCancelacionController],
  providers: [PoliticasCancelacionService],
})
export class PoliticasCancelacionModule {}
