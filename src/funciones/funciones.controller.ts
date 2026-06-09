import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { FuncionesService } from './funciones.service';
import { CreateFuncionDto } from './dto/create-funcion.dto';
import { UpdateFuncionDto } from './dto/update-funcion.dto';
import { BloquearAsientoDto } from '../asientos/dto/bloquear-asiento.dto';

@ApiTags('Funciones')
@Controller('funciones')
export class FuncionesController {
  constructor(private readonly funcionesService: FuncionesService) {}

  @Get(':id/reservas-activas')
  @ApiOperation({ summary: 'Obtener reservas activas de una función' })
  @ApiParam({ name: 'id', description: 'ID de la función' })
  getReservasActivas(@Param('id', ParseIntPipe) id: number) {
    return this.funcionesService.getReservasActivasByFuncion(id);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar una función y notificar a usuarios con reservas' })
  @ApiParam({ name: 'id', description: 'ID de la función' })
  cancelarFuncion(@Param('id', ParseIntPipe) id: number) {
    return this.funcionesService.cancelarFuncion(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva función' })
  create(@Body() createFuncionDto: CreateFuncionDto) {
    return this.funcionesService.create(createFuncionDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de una función' })
  @ApiParam({ name: 'id', description: 'ID de la función' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFuncionDto: UpdateFuncionDto) {
    return this.funcionesService.update(id, updateFuncionDto);
  }

  @Get(':id/asientos')
  @ApiOperation({ summary: 'Obtener asientos de una función' })
  @ApiParam({ name: 'id', description: 'ID de la función' })
  getAsientos(@Param('id', ParseIntPipe) id: number) {
    return this.funcionesService.getAsientosByFuncion(id);
  }

  @Post(':id/asientos/bloquear')
  @ApiOperation({ summary: 'Bloquear asientos temporalmente en una función' })
  @ApiParam({ name: 'id', description: 'ID de la función' })
  bloquearAsientos(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BloquearAsientoDto,
  ) {
    return this.funcionesService.bloquearAsientos(id, dto);
  }
}
