import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PeliculasService } from './peliculas.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { UpdateEstadoPeliculaDto } from './dto/update-estado-pelicula.dto';

@ApiTags('Peliculas')
@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva película' })
  create(@Body() createPeliculaDto: CreatePeliculaDto) {
    return this.peliculasService.create(createPeliculaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las películas' })
  findAll() {
    return this.peliculasService.findAll();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar películas por título, género, ciudad o fecha de estreno',
  })
  @ApiQuery({ name: 'titulo', required: false, description: 'Búsqueda parcial por título' })
  @ApiQuery({ name: 'genero', required: false, description: 'Nombre del género' })
  @ApiQuery({ name: 'ciudad', required: false, description: 'Ciudad donde se proyecta' })
  @ApiQuery({ name: 'fecha', required: false, description: 'Fecha de estreno (YYYY-MM-DD)' })
  search(
    @Query('titulo') titulo?: string,
    @Query('genero') genero?: string,
    @Query('ciudad') ciudad?: string,
    @Query('fecha') fecha?: string,
  ) {
    return this.peliculasService.search({ titulo, genero, ciudad, fecha });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una película por ID' })
  @ApiParam({ name: 'id', description: 'ID de la película' })
  findOne(@Param('id') id: string) {
    return this.peliculasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de una película' })
  @ApiParam({ name: 'id', description: 'ID de la película' })
  update(
    @Param('id') id: string,
    @Body() updatePeliculaDto: UpdatePeliculaDto,
  ) {
    return this.peliculasService.update(+id, updatePeliculaDto);
  }

  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Activar o desactivar una película en el catálogo',
  })
  @ApiParam({ name: 'id', description: 'ID de la película' })
  updateEstado(
    @Param('id') id: string,
    @Body() updateEstadoDto: UpdateEstadoPeliculaDto,
  ) {
    return this.peliculasService.updateEstado(+id, updateEstadoDto.activo);
  }

  @Post(':id/poster')
  @ApiOperation({ summary: 'Subir poster de una película' })
  @ApiParam({ name: 'id', description: 'ID de la película' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('poster', {
      storage: diskStorage({
        destination: './uploads/posters',
        filename: (_, file, cb) => {
          cb(null, `${Date.now()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.match(/image\/(jpg|jpeg|png|webp)/)) {
          return cb(
            new BadRequestException(
              'Solo se permiten imágenes (jpg, jpeg, png, webp)',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadPoster(@Param('id') id: string, @UploadedFile() file: any) {
    return this.peliculasService.uploadPoster(+id, file);
  }

  @Get(':id/cines/:cineId/funciones')
  @ApiOperation({ summary: 'Obtener funciones disponibles de una película por cine con disponibilidad de asientos' })
  @ApiParam({ name: 'id', description: 'ID de la película' })
  @ApiParam({ name: 'cineId', description: 'ID del cine' })
  getFuncionesByCine(
    @Param('id') id: string,
    @Param('cineId') cineId: string,
  ) {
    return this.peliculasService.getFuncionesByCine(+id, +cineId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una película' })
  @ApiParam({ name: 'id', description: 'ID de la película' })
  remove(@Param('id') id: string) {
    return this.peliculasService.remove(+id);
  }
}
