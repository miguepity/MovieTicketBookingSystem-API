import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PeliculasService } from './peliculas.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { QueryPeliculaDto } from './dto/query-pelicula.dto';

@ApiTags('Peliculas')
@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Post()
  createPelicula(@Body() dto: CreatePeliculaDto) {
    return this.peliculasService.createPelicula(dto);

  @Get()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @ApiOperation({
    summary: 'Obtener películas activas, con búsqueda opcional por título',
  })
  buscar(@Query() query: QueryPeliculaDto) {
    return this.peliculasService.getTitulo(query.titulo);
  }
}
