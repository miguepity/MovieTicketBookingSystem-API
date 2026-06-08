import { Module } from '@nestjs/common';
import { PoliticasCancelacionService } from './politicas-cancelacion.service';
import { PoliticasCancelacionController } from './politicas-cancelacion.controller';

@Module({
  controllers: [PoliticasCancelacionController],
  providers: [PoliticasCancelacionService],
})
export class PoliticasCancelacionModule {}
