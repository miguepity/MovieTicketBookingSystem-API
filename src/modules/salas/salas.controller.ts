import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { SalasService } from './salas.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ApiConflictResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { SalaResponseDto } from './dto/sala.response.dto';

@Controller('salas')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una sala nueva' })
  @ApiCreatedResponse({ type: CreateSalaDto })
  @ApiConflictResponse({ description: 'Nombre duplicado' })
  create(@Body() createSalaDto: CreateSalaDto): Promise<SalaResponseDto> {
    return this.salasService.create(createSalaDto).then((sala) => ({
      ...sala,
      id: Number(sala.id),
      id_cine: Number(sala.id_cine),
    }));
  }

  @Get()
  findAll() {
    return this.salasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalaDto: UpdateSalaDto) {
    return this.salasService.update(+id, updateSalaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salasService.remove(+id);
  }
}
