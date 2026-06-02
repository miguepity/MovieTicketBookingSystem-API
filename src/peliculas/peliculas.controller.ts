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
  buscar(@Query() query: QueryPeliculaDto) {
    return this.peliculasService.getTitulo(query.titulo);
  }
  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @ApiOperation({ summary: 'Editar una película por ID' })
  @ApiParam({ name: 'id', description: 'ID de la película a editar' })
  editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePeliculaDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.peliculasService.update(id, dto, req.user.userId);
  }
}
