import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PeliculaService } from './pelicula.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';

@ApiTags('Peliculas')
@Controller('peliculas')
export class PeliculaController {
  constructor(private readonly peliculaService: PeliculaService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar películas con búsqueda parcial por título',
  })
  @ApiQuery({
    name: 'titulo',
    required: false,
    description: 'Coincidencia parcial sobre el título (case-insensitive)',
  })
  @ApiOkResponse({ description: 'Listado de películas' })
  findAll(@Query('titulo') titulo?: string) {
    return this.peliculaService.findAll(titulo);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva película' })
  @ApiCreatedResponse({ description: 'Película creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  createPelicula(@Body() data: CreatePeliculaDto) {
    return this.peliculaService.createPelicula(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar una película existente' })
  @ApiOkResponse({ description: 'Película actualizada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Película no encontrada' })
  updatePelicula(@Param('id') id: string, @Body() data: UpdatePeliculaDto) {
    return this.peliculaService.updatePelicula(id, data);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Alternar el estado activo/inactivo de una película',
  })
  @ApiOkResponse({ description: 'Estado de la película actualizado' })
  @ApiNotFoundResponse({ description: 'Película no encontrada' })
  toggleActivo(@Param('id') id: string) {
    return this.peliculaService.toggleActivo(id);
  }
}
