import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CiudadesService } from './ciudad.service';
import { CreateCiudadDto } from './create-ciudad.dto';
import { UpdateCiudadDto } from './update-ciudad.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


@ApiTags('Ciudades') 
@Controller('ciudades')
export class CiudadesController {
  constructor(private readonly ciudadesService: CiudadesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva ciudad ' })
  @ApiResponse({ status: 201, description: 'Ciudad creada con éxito.' })
  @ApiResponse({ status: 409, description: 'La ciudad ya existe.' })
  create(@Body() createCiudadDto: CreateCiudadDto) {
    return this.ciudadesService.create(createCiudadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener la lista de todas las ciudades '})
  @ApiResponse({ status: 200, description: 'Lista de ciudades retornada con éxito.' })
  findAll() {
    return this.ciudadesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ciudad por su ID ' })
  @ApiParam({ name: 'id', description: 'ID numérico de la ciudad' })
  @ApiResponse({ status: 200, description: 'Ciudad encontrada.' })
  @ApiResponse({ status: 404, description: 'Ciudad no encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ciudadesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar una ciudad por ID ' })
  @ApiParam({ name: 'id', description: 'ID numérico de la ciudad a modificar' })
  @ApiResponse({ status: 200, description: 'Ciudad actualizada con éxito.' })
  @ApiResponse({ status: 404, description: 'Ciudad no encontrada.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCiudadDto: UpdateCiudadDto) {
    return this.ciudadesService.update(id, updateCiudadDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una ciudad por ID ' })
  @ApiParam({ name: 'id', description: 'ID numérico de la ciudad a eliminar' })
  @ApiResponse({ status: 200, description: 'Ciudad eliminada con éxito.' })
  @ApiResponse({ status: 404, description: 'Ciudad no encontrada.' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar (tiene cines vinculados).' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ciudadesService.remove(id);
  }
}