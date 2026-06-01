import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PeliculaService } from './pelicula.service';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';

@ApiTags('Peliculas')
@Controller('peliculas')
export class PeliculaController {
  constructor(private readonly peliculaService: PeliculaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva película' })
  @ApiCreatedResponse({ description: 'Película creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  createPelicula(@Body() data: CreatePeliculaDto) {
    return this.peliculaService.createPelicula(data);
  }
}
