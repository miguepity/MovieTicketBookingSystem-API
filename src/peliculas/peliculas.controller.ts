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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PeliculasService } from './peliculas.service';
import { QueryPeliculaDto } from './dto/query-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { AuthGuard } from '../auth/auth.guard';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
@ApiTags('Peliculas')
@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Get()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @ApiOperation({
    summary: 'Obtener películas activas, con búsqueda opcional por título',
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
  async buscar(@Query() query: QueryPeliculaDto) {
    const movies = await this.peliculasService.getTitulo(query.titulo);

    return movies.map((movie) => {
      return {
        ...movie,
        id: movie.id.toString(),
        id_idioma: movie.id_idioma.toString(),
        id_genero: movie.id_genero.toString(),
        id_usuario: movie.id_usuario.toString(),
      };
    });
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @ApiOperation({ summary: 'Editar una película por ID' })
  @ApiParam({ name: 'id', description: 'ID de la película a editar' })
  @ApiResponse({
    status: 200,
    description: 'Película actualizada exitosamente',
    schema: {
      example: {
        id: 1,
        titulo: 'The Matrix Updated',
        sinopsis: '...',
        poster_url: '...',
        fecha_estreno: '1999-03-31',
        activo: true,
        updated_at: '2026-06-07T12:00:00Z',
        id_usuario: '1',
        idiomas: { nombre: 'Inglés' },
        generos: { nombre: 'Ciencia Ficción' },
      },
    },
  })
  editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePeliculaDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.peliculasService.update(id, dto, req.user.userId);
  }

  @Get(':id/cines/:cineId/funciones')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
}
