/// <reference types="multer" />
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PeliculaService } from './pelicula.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { QueryPeliculaDto } from './dto/query-pelicula.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('Peliculas')
@Controller('peliculas')
export class PeliculaController {
  constructor(private readonly peliculaService: PeliculaService) {}

  @Get()
  @ApiOperation({
    summary:
      'Listar películas con filtros por título, género, idioma, ciudad y rango de funciones',
  })
  @ApiOkResponse({ description: 'Listado de películas' })
  findAll(@Query() query: QueryPeliculaDto) {
    return this.peliculaService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva película' })
  @ApiCreatedResponse({ description: 'Película creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  createPelicula(
    @Body() data: CreatePeliculaDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.peliculaService.createPelicula(data, BigInt(user.userId));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Editar una película existente' })
  @ApiOkResponse({ description: 'Película actualizada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Película no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  updatePelicula(@Param('id') id: string, @Body() data: UpdatePeliculaDto) {
    return this.peliculaService.updatePelicula(id, data);
  }

  @Post(':id/poster')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir poster de una película a Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ description: 'Poster subido y URL actualizada' })
  @ApiBadRequestResponse({ description: 'Archivo inválido o faltante' })
  @ApiNotFoundResponse({ description: 'Película no encontrada' })
  uploadPoster(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|jpg)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.peliculaService.uploadPoster(id, file);
  }

  @Get(':id/cines')
  @ApiOperation({
    summary: 'Obtener cines con funciones activas para una película',
  })
  @ApiOkResponse({ description: 'Listado de cines con sus funciones activas' })
  @ApiNotFoundResponse({ description: 'Película no encontrada' })
  getCinesByPelicula(@Param('id') id: string) {
    return this.peliculaService.findCinesByPelicula(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Alternar el estado activo/inactivo de una película',
  })
  @ApiOkResponse({ description: 'Estado de la película actualizado' })
  @ApiNotFoundResponse({ description: 'Película no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  toggleActivo(@Param('id') id: string) {
    return this.peliculaService.toggleActivo(id);
  }
}
