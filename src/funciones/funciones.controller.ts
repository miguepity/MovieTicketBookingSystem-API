import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FuncionesService } from './funciones.service';
import { CreateFuncioneDto } from './dto/create-funcione.dto';
import { UpdateFuncioneDto } from './dto/update-funcione.dto';

@Controller('funciones')
export class FuncionesController {
  constructor(private readonly funcionesService: FuncionesService) {}

  @Post()
  create(@Body() createFuncioneDto: CreateFuncioneDto) {
    return this.funcionesService.create(createFuncioneDto);
  }

  @Get()
  findAll() {
    return this.funcionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.funcionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFuncioneDto: UpdateFuncioneDto) {
    return this.funcionesService.update(+id, updateFuncioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.funcionesService.remove(+id);
  }
}
