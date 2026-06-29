import {
  Controller,
  Get,
  Query,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PeliculasService } from './peliculas.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UploadPosterDto } from './dto/upload-poster.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Peliculas')
@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create a new movie.',
    responses: {
      201: {
        description: 'The movie has been created Succesfully',
        content: {
          'application/json': {
            example: {
              id: 1,
              titulo: 'Project Hail Marry',
              sinopsis: 'sinopsis de la pelicula',
              poster_url: 'http://image.link/12345',
              idioma_id: 1,
              genero_id: 1,
              fecha_estreno: '2026-03-09',
              activo: 'true',
              created_at: '2026-03-09 15:00:00+00',
              updated_at: '',
              updated_by: '',
            },
          },
        },
      },
      500: { description: 'Internal server error' },
    },
  })
  createPelicula(@Body() dto: CreatePeliculaDto) {
    return this.peliculasService.createPelicula(dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Obtener peliculas activas con busqueda opcional por titulo',
    responses: {
      200: {
        description: 'Lista de peliculas',
        content: {
          'application/json': {
            example: [
              {
                id: '1',
                titulo: 'Avatar',
                sinopsis: 'Sinopsis',
                poster_url: 'http://image.link/12345',
                fecha_estreno: '2026-03-09',
                idiomas: { nombre: 'Ingles' },
                generos: { nombre: 'Accion' },
              },
            ],
          },
        },
      },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de películas encontradas',
    schema: {
      example: [
        {
          id: 1,
          titulo: 'The Matrix',
          sinopsis: '...',
          poster_url: '...',
          fecha_estreno: '1999-03-31',
          idiomas: { nombre: 'Inglés' },
          generos: { nombre: 'Ciencia Ficción' },
        },
      ],
    },
  })
  async buscar(@Query('titulo') query: string) {
    const movies = await this.peliculasService.getTitulo(query);

    return movies.map((movie) => {
      return {
        ...movie,
        id: movie.id.toString(),
        id_genero: movie.id_genero ? movie.id_genero.toString() : null,
        id_usuario: movie.id_usuario.toString(),
        id_idioma: movie.id_idioma ? movie.id_idioma.toString() : null,
      };
    });
  }

  @Post(':id/poster')
  @ApiOperation({
    description: 'Subir el poster de una pelicula por su ID',
    responses: {
      201: { description: 'Poster subido exitosamente' },
      404: { description: 'Pelicula no encontrada' },
      500: { description: 'Error interno del servidor' },
    },
  })
  async uploadPoster(@Param('id') id: string, @Body() dto: UploadPosterDto) {
    const newMovie = await this.peliculasService.uploadPoster(BigInt(id), dto);
    return {
      ...newMovie,
      id: newMovie.id.toString(),
      id_genero: newMovie.id_genero ? newMovie.id_genero.toString() : null,
      id_usuario: newMovie.id_usuario.toString(),
      id_idioma: newMovie.id_idioma ? newMovie.id_idioma.toString() : null,
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Editar una pelicula por ID',
    responses: {
      200: {
        description: 'Pelicula actualizada exitosamente',
        content: {
          'application/json': {
            example: {
              id: '1',
              titulo: 'Avatar actualizado',
              sinopsis: 'Sinopsis actualizada',
              poster_url: 'http://image.link/12345',
              fecha_estreno: '2026-03-09',
              activo: true,
              updated_at: '2026-06-07T00:00:00.000Z',
              id_usuario: '1',
              idiomas: { nombre: 'Ingles' },
              generos: { nombre: 'Accion' },
            },
          },
        },
      },
      401: { description: 'No autorizado' },
      404: { description: 'Pelicula no encontrada' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID de la pelicula a editar' })
  async editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePeliculaDto,
    @Request() req: { user: { userId: number } },
  ) {
    const movie = await this.peliculasService.update(id, dto, req.user.userId);
    return {
      ...movie,
      id: movie.id.toString(),
      id_genero: movie.id_genero ? movie.id_genero.toString() : null,
      id_usuario: movie.id_usuario.toString(),
      id_idioma: movie.id_idioma ? movie.id_idioma.toString() : null,
    };
  }

  @Get(':id/cines/:cineId/funciones')
  @ApiOperation({
    summary:
      'Obtener funciones de una película en un cine específico con disponibilidad de asientos',
  })
  @ApiParam({ name: 'id', description: 'ID de la película' })
  @ApiParam({ name: 'cineId', description: 'ID del cine' })
  @ApiResponse({
    status: 200,
    description: 'Lista de funciones con disponibilidad',
    schema: {
      example: [
        {
          id: '1',
          fecha_hora: '2026-06-07T18:00:00Z',
          estado: 'active',
          salas: {
            id: '1',
            nombre: 'Sala 1',
            cines: { id: '1', nombre: 'Cinépolis' },
          },
          _count: { asientosFuncions: 40 },
        },
      ],
    },
  })
  getFunciones(
    @Param('id', ParseIntPipe) id: number,
    @Param('cineId', ParseIntPipe) cineId: number,
  ) {
    return this.peliculasService.getFuncionesPorCine(id, cineId);
  }

  @Get('all')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getAll() {
    const movies = await this.peliculasService.getAll();

    return movies.map((movie) => ({
      ...movie,
      id: movie.id.toString(),
      id_genero: movie.id_genero?.toString() ?? null,
      id_usuario: movie.id_usuario.toString(),
      id_idioma: movie.id_idioma?.toString() ?? null,
    }));
  }
}
