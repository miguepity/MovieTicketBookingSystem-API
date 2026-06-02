import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PeliculasService } from './peliculas.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { QueryPeliculaDto } from './dto/query-pelicula.dto';
import { UploadPosterDto } from './dto/upload-poster.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
@ApiTags('Peliculas')
@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
    },
  })
  @Post()
  createPelicula(@Body() dto: CreatePeliculaDto) {
    return this.peliculasService.createPelicula(dto);
  }

  @Get()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @ApiOperation({
    summary: 'Obtener películas activas, con búsqueda opcional por título',
  })
  buscar(@Query() query: QueryPeliculaDto) {
    return this.peliculasService.getTitulo(query.titulo);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @ApiOperation({
    description: 'Upload the poster for a movie by its id.',
    responses: {
      201: {
        description: 'Poster uploaded succesfully',
      },
    },
  })
  @Post(':id/poster')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  uploadPoster(@Param('id') id: string, @Body() dto: UploadPosterDto) {
    return this.peliculasService.uploadPoster(BigInt(id), dto);
  }
}
