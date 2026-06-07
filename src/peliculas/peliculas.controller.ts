import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PeliculasService } from './peliculas.service.js';
import { CreatePeliculaDto } from './dto/create-pelicula.dto.js';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto.js';
import { ToggleStatusPeliculaDto } from './dto/toggle-status-pelicula.dto.js';
import { BuscarPeliculaDto } from './dto/buscar-pelicula.dto.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('Películas')
@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar y buscar películas activas con filtros opcionales' })
  @ApiQuery({ name: 'titulo', required: false, description: 'Búsqueda parcial por título (insensible a mayúsculas)', example: 'El Padrino' })
  @ApiQuery({ name: 'genero', required: false, description: 'ID del género para filtrar', example: '1' })
  @ApiQuery({ name: 'idioma', required: false, description: 'ID del idioma para filtrar', example: '1' })
  @ApiQuery({ name: 'fecha_inicio', required: false, description: 'Fecha de estreno desde (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'fecha_fin', required: false, description: 'Fecha de estreno hasta (YYYY-MM-DD)', example: '2026-12-31' })
  @ApiQuery({ name: 'ciudad_id', required: false, description: 'ID de la ciudad — filtra películas con funciones activas en esa ciudad', example: '1' })
  @ApiResponse({ status: 200, description: 'Lista de películas retornada exitosamente.' })
  buscar(@Query() query: BuscarPeliculaDto) {
    return this.peliculasService.buscar(query);
  }

  @Get(':id/cines')
  @ApiOperation({ summary: 'Cines con funciones activas para una película' })
  @ApiParam({ name: 'id', description: 'ID de la película', example: '1' })
  @ApiResponse({ status: 200, description: 'Lista de cines con funciones activas retornada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Película no encontrada.' })
  getCinesByPelicula(@Param('id') id: string) {
    return this.peliculasService.getCinesByPelicula(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva película' })
  @ApiResponse({ status: 201, description: 'Película creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos o relación inexistente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol ADMIN.' })
  create(@Body() body: CreatePeliculaDto) {
    return this.peliculasService.create(body);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar los datos de una película' })
  @ApiParam({ name: 'id', description: 'ID de la película a actualizar', example: '1' })
  @ApiResponse({ status: 200, description: 'Película actualizada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol ADMIN.' })
  @ApiResponse({ status: 404, description: 'Película no encontrada.' })
  update(@Param('id') id: string, @Body() body: UpdatePeliculaDto) {
    return this.peliculasService.update(id, body);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Activar o desactivar una película' })
  @ApiParam({ name: 'id', description: 'ID de la película a activar/desactivar', example: '1' })
  @ApiResponse({ status: 200, description: 'Estado de la película cambiado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol ADMIN.' })
  @ApiResponse({ status: 404, description: 'Película no encontrada.' })
  toggleStatus(@Param('id') id: string, @Body() body: ToggleStatusPeliculaDto) {
    return this.peliculasService.toggleStatus(id, body);
  }
}
