import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PeliculasService } from './peliculas.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { ChangeEstadoPeliculaDto } from './dto/change-estado-pelicula.dto';

@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Post()
  create(@Body() createPeliculaDto: CreatePeliculaDto) {
    return this.peliculasService.create(createPeliculaDto);
  }

  @Get()
  findAll() {
    return this.peliculasService.findAll();
  }

  @Get('buscar')
  buscar(
    @Query('titulo') titulo?: string,
    @Query('id_genero') id_genero?: string,
    @Query('id_idioma') id_idioma?: string,
  ) {
    return this.peliculasService.buscar(
      titulo,
      id_genero ? +id_genero : undefined,
      id_idioma ? +id_idioma : undefined,
    );
  }

  @Get('cine/:id_cine')
  buscarPorCine(@Param('id_cine') id_cine: string) {
    return this.peliculasService.buscarPorCine(+id_cine);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.peliculasService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePeliculaDto: UpdatePeliculaDto,
  ) {
    return this.peliculasService.update(+id, updatePeliculaDto);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id') id: string,
    @Body() dto: ChangeEstadoPeliculaDto,
  ) {
    return this.peliculasService.cambiarEstado(+id, dto.activo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.peliculasService.remove(+id);
  }
}
