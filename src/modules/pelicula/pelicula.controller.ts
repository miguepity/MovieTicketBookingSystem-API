/// <reference types="multer" />
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipe,
  Patch,
  Post,
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
  ApiConflictResponse,
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
import { SetActivoPeliculaDto } from './dto/set-activo.dto';
import { PeliculaResponseDto } from './dto/pelicula-response.dto';
import { PeliculasPageResponseDto } from './dto/peliculas-page-response.dto';
import { PosterUploadResponseDto } from './dto/poster-upload-response.dto';
import { CineConFuncionesResponseDto } from './dto/cine-con-funciones-response.dto';
import { FuncionesPorCineResponseDto } from './dto/funciones-por-cine-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
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
  @ApiOkResponse({ description: 'Listado de películas', type: PeliculasPageResponseDto })
  findAll(@Query() query: QueryPeliculaDto) {
    return this.peliculaService.findAll(query);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary:
      'Obtener detalle de una película; incluye mi_calificacion si el usuario está autenticado',
  })
  @ApiOkResponse({ description: 'Detalle de la película', type: PeliculaResponseDto })
  @ApiNotFoundResponse({ description: 'Película no encontrada' })
  findOne(@Param('id') id: string, @CurrentUser() user?: CurrentUserPayload) {
    const idUsuario = user?.userId ? BigInt(user.userId) : undefined;
    return this.peliculaService.findOne(BigInt(id), idUsuario);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva película' })
  @ApiCreatedResponse({ description: 'Película creada exitosamente', schema: { type: 'object', properties: { id: { type: 'string', example: '1' } }, required: ['id'] } })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  createPelicula(
    @Body() data: CreatePeliculaDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.peliculaService.createPelicula(data, BigInt(user.userId));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Editar una película existente' })
  @ApiBody({ type: UpdatePeliculaDto })
  @ApiOkResponse({ description: 'Película actualizada exitosamente', type: PeliculaResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Película no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  updatePelicula(
    @Param('id') id: string,
    @Body() data: UpdatePeliculaDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.peliculaService.updatePelicula(id, data, BigInt(user.userId));
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
  @ApiOkResponse({ description: 'Poster subido y URL actualizada', type: PosterUploadResponseDto })
  @ApiBadRequestResponse({ description: 'Archivo inválido o faltante' })
  @ApiNotFoundResponse({ description: 'Película no encontrada' })
  uploadPoster(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|jpg)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.peliculaService.uploadPoster(id, file, BigInt(user.userId));
  }

  @Get(':id/cines')
  @ApiOperation({
    summary: 'Obtener cines con funciones activas para una película',
  })
  @ApiOkResponse({ description: 'Listado de cines con sus funciones activas', type: CineConFuncionesResponseDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Película no encontrada' })
  getCinesByPelicula(@Param('id') id: string) {
    return this.peliculaService.findCinesByPelicula(id);
  }

  @Get(':id/cines/:cineId/funciones')
  @ApiOperation({
    summary:
      'Listar funciones activas futuras de una película en un cine, con disponibilidad de asientos',
  })
  @ApiOkResponse({ description: 'Listado de funciones con disponibilidad', type: FuncionesPorCineResponseDto })
  @ApiNotFoundResponse({ description: 'Película o cine no encontrados' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  findFuncionesByPeliculaAndCine(
    @Param('id') id: string,
    @Param('cineId') cineId: string,
  ) {
    return this.peliculaService.findFuncionesByPeliculaAndCine(id, cineId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete de una película (admin)' })
  @ApiOkResponse({ description: 'Película marcada como eliminada (activo=false, deleted_at set)', type: PeliculaResponseDto })
  @ApiConflictResponse({ description: 'Película tiene funciones futuras' })
  @ApiNotFoundResponse({ description: 'Película no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  softDelete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.peliculaService.softDelete(BigInt(id), BigInt(user.userId));
  }

  @Patch(':id/activo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Establecer el estado activo de una película (admin)' })
  @ApiBody({ type: SetActivoPeliculaDto })
  @ApiOkResponse({ description: 'Estado de la película actualizado', type: PeliculaResponseDto })
  @ApiNotFoundResponse({ description: 'Película no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  setActivo(
    @Param('id') id: string,
    @Body() dto: SetActivoPeliculaDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.peliculaService.setActivo(BigInt(id), dto.activo, BigInt(user.userId));
  }

  /**
   * @deprecated Use PATCH /peliculas/:id/activo instead.
   * Kept for one release as backward-compatible alias.
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Deprecated] Alternar el estado activo/inactivo de una película — use /activo',
    deprecated: true,
  })
  @ApiOkResponse({ description: 'Estado de la película actualizado', type: PeliculaResponseDto })
  @ApiNotFoundResponse({ description: 'Película no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  toggleActivo(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.peliculaService.toggleActivo(id, BigInt(user.userId));
  }
}
