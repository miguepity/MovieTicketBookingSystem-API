import { Controller, Get, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { FuncionesService } from './funciones.service';

@Controller('funciones')
export class FuncionesController {
  constructor(private readonly funcionesService: FuncionesService) {}

  @Get(':id/reservas-activas')
  getReservasActivas(@Param('id', ParseIntPipe) id: number) {
    return this.funcionesService.getReservasActivasByFuncion(id);
  }

  @Patch(':id/cancelar')
  cancelarFuncion(@Param('id', ParseIntPipe) id: number) {
    return this.funcionesService.cancelarFuncion(id);
  }
}
