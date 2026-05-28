import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PeliculasService } from './peliculas.service';
import { QueryPeliculaDto } from './dto/query-pelicula.dto';

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
  buscar(@Query() query: QueryPeliculaDto) {
    return this.peliculasService.getTitulo(query.titulo);
  }
}
