import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CinesService } from './cine.service';
import { CreateCineDto } from './create-cine.dto';
import { UpdateCineDto } from './update-cine.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Cines')
@Controller('cines')
export class CinesController {
  constructor(private readonly cinesService: CinesService) {}

  @Post()
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo cine ' })
  @ApiResponse({ status: 201, description: 'Cine creado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'La ciudad especificada no existe.' })
  @ApiResponse({ status: 409, description: 'Nombre duplicado en esta ciudad.' })
  create(@Body() createCineDto: CreateCineDto) {
    return this.cinesService.create(createCineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los cines con sus ciudades' })
  @ApiResponse({ status: 200, description: 'Lista de cines retornada con éxito.' })
  @ApiResponse({ status: 404, description: 'No se encontraron cines.' })
  findAll() {
    return this.cinesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cine por su ID' })
  @ApiResponse({ status: 200, description: 'Cine encontrado con éxito.' })
  @ApiResponse({ status: 404, description: 'Cine no encontrado.' })
  @ApiParam({ name: 'id', description: 'ID numérico del cine' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cinesService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar un cine por ID ' })
  @ApiParam({ name: 'id', description: 'ID numérico del cine a modificar' })
  @ApiResponse({ status: 200, description: 'Cine modificado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Cine no encontrado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCineDto: UpdateCineDto) {
    return this.cinesService.update(id, updateCineDto);
  }

  @Delete(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un cine por ID ' })
  @ApiResponse({ status: 200, description: 'Cine eliminado con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Cine no encontrado.' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar (Tiene funciones asignadas).' })
  @ApiParam({ name: 'id', description: 'ID del cine a remover' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cinesService.remove(id);
  }
}