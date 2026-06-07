import { Body, Controller, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PeliculasService } from './peliculas.service.js';
import { CreatePeliculaDto } from './dto/create-pelicula.dto.js';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto.js';
import { ToggleStatusPeliculaDto } from './dto/toggle-status-pelicula.dto.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('Películas')
@ApiBearerAuth()
@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Post()
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
