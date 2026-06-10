import 'multer';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  ParseIntPipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Listar y buscar películas activas con filtros opcionales',
  })
  @ApiQuery({
    name: 'titulo',
    required: false,
    description: 'Búsqueda parcial por título (insensible a mayúsculas)',
    example: 'El Padrino',
  })
  @ApiQuery({
    name: 'genero',
    required: false,
    description: 'ID del género para filtrar',
    example: '1',
  })
  @ApiQuery({
    name: 'idioma',
    required: false,
    description: 'ID del idioma para filtrar',
    example: '1',
  })
  @ApiQuery({
    name: 'fecha_inicio',
    required: false,
    description: 'Fecha de estreno desde (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'fecha_fin',
    required: false,
    description: 'Fecha de estreno hasta (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @ApiQuery({
    name: 'ciudad_id',
    required: false,
    description:
      'ID de la ciudad — filtra películas con funciones activas en esa ciudad',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de películas retornada exitosamente.',
  })
  buscar(@Query() query: BuscarPeliculaDto) {
    return this.peliculasService.buscar(query);
  }

  @Get(':id/cines/:cineId/funciones')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener funciones para una película y un cine específicos' })
  @ApiParam({ name: 'id', description: 'ID de la película', example: '1' })
  @ApiParam({ name: 'cineId', description: 'ID del cine', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Funciones con asientos retornadas exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Película o cine no encontrado.' })
  @ApiResponse({ status: 400, description: 'IDs de película o cine inválidos.' })
  async getFuncionesPorPeliculaYCine(
    @Param('id', ParseIntPipe) peliculaId: number,
    @Param('cineId', ParseIntPipe) cineId: number,
  ) {
    return this.peliculasService.buscarFuncionesConAsientos(peliculaId, cineId);
  }

  @Get(':id/cines')
  @ApiOperation({ summary: 'Cines con funciones activas para una película' })
  @ApiParam({ name: 'id', description: 'ID de la película', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cines con funciones activas retornada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Película no encontrada.' })
  getCinesByPelicula(@Param('id') id: string) {
    return this.peliculasService.getCinesByPelicula(id);
  }

  @Post()
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva película' })
  @ApiResponse({ status: 201, description: 'Película creada exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o relación inexistente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Se requiere rol ADMIN.',
  })
  create(@Body() body: CreatePeliculaDto,
    @Req() req: any) {
    return this.peliculasService.create(body, req.user.id);
  }

  @Post(':id/poster')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('poster', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir o reemplazar el poster de una película' })
  @ApiParam({ name: 'id', description: 'ID de la película', example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['poster'],
      properties: {
        poster: {
          type: 'string',
          format: 'binary',
          description: 'Imagen del poster (JPEG, PNG o WebP, máximo 5 MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Poster subido y URL actualizada exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido, muy pesado o formato no permitido.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Se requiere rol ADMIN.',
  })
  @ApiResponse({ status: 404, description: 'Película no encontrada.' })
  uploadPoster(
    @Param('id') id: string,
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.peliculasService.uploadPoster(id, file, req.user.id);
  }

  @Put(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar los datos de una película' })
  @ApiParam({
    name: 'id',
    description: 'ID de la película a actualizar',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Película actualizada exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Se requiere rol ADMIN.',
  })
  @ApiResponse({ status: 404, description: 'Película no encontrada.' })
  update(@Param('id') id: string, @Body() body: UpdatePeliculaDto,
    @Req() req: any) {
    return this.peliculasService.update(id, body, req.user.id);
  }

  @Patch(':id/status')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Activar o desactivar una película' })
  @ApiParam({
    name: 'id',
    description: 'ID de la película a activar/desactivar',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la película cambiado exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Se requiere rol ADMIN.',
  })
  @ApiResponse({ status: 404, description: 'Película no encontrada.' })
  toggleStatus(@Param('id') id: string, @Body() body: ToggleStatusPeliculaDto,
    @Req() req: any) {
    return this.peliculasService.toggleStatus(id, body, req.user.id);
  }
}
