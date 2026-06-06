import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GenerosService } from './generos.service';
import { CreateGeneroDto } from './create-generos.dto';
import { UpdateGeneroDto } from './update-generos.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Géneros Cinematográficos')
@Controller('generos')
export class GenerosController {
  constructor(private readonly generosService: GenerosService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo género ' })
  @ApiResponse({ status: 201, description: 'Género creado con éxito.' })
  @ApiResponse({ status: 409, description: 'El nombre del género ya existe.' })
  create(@Body() createGeneroDto: CreateGeneroDto) {
    return this.generosService.create(createGeneroDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los géneros ' })
  @ApiResponse({ status: 200, description: 'Lista de géneros retornada con éxito.' })
  findAll() {
    return this.generosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un género por ID' })
  @ApiResponse({ status: 200, description: 'Género retornado con éxito.' })
  @ApiResponse({ status: 404, description: 'Género no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.generosService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar un género ' })
  @ApiResponse({ status: 200, description: 'Género actualizado con éxito.' })
  @ApiResponse({ status: 404, description: 'Género no encontrado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGeneroDto: UpdateGeneroDto) {
    return this.generosService.update(id, updateGeneroDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un género ' })
  @ApiResponse({ status: 200, description: 'Género eliminado con éxito.' })
  @ApiResponse({ status: 404, description: 'Género no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.generosService.remove(id);
  }
}