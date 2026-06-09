import { Controller, Post, Body, Param, Patch, Put } from '@nestjs/common';
import { FuncionesService } from './funciones.service';
import { CreateFuncioneDto } from './dto/create-funcione.dto';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { UpdateFuncioneDto } from './dto/update-funcione.dto';

@ApiTags('Funciones')
@Controller('funciones')
export class FuncionesController {
  constructor(private readonly funcionesService: FuncionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva función' })
  @ApiResponse({
    status: 201,
    description: 'Función creada exitosamente',
    schema: {
      example: {
        id: '1',
        id_pelicula: '1',
        id_sala: '1',
        fecha_hora: '2026-06-07T18:00:00Z',
        estado: 'active',
      },
    },
  })
  async create(@Body() createFuncioneDto: CreateFuncioneDto) {
    const newFuncion = await this.funcionesService.create(createFuncioneDto);
    return {
      ...newFuncion,
      id: newFuncion.id.toString(),
      id_sala: newFuncion.id_sala.toString(),
      id_pelicula: newFuncion.id_pelicula.toString(),
    };
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancela una función' })
  @ApiResponse({
    status: 200,
    description: 'Función cancelada exitosamente',
  })
  async cancel(@Param('id') id: string) {
    return await this.funcionesService.cancel(id);
  }

  @Put(':id')
  async edit(@Param('id') id: string, @Body() dto: UpdateFuncioneDto) {
    return await this.funcionesService.edit(id, dto);
  }
}
