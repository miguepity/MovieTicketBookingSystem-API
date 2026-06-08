import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { FuncionesService } from './funciones.service';
import { CreateFuncionDto } from './dto/create-funcion.dto';
import { UpdateFuncionDto } from './dto/update-funcion.dto';

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
  
  @Post()
  create(@Body() createFuncionDto: CreateFuncionDto) {
    return this.funcionesService.create(createFuncionDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFuncionDto: UpdateFuncionDto) {
    return this.funcionesService.update(+id, updateFuncionDto);
  }

  @Patch(':id/cancelar')
  cancel(@Param('id') id: string) {
    return this.funcionesService.cancel(+id);
  }
}
