import {
  Controller,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
  Get,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { GeneroService } from './genero.service';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Generos')
@Controller('generos')
export class GeneroController {
  constructor(private readonly generoService: GeneroService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Crear un nuevo genero',
    responses: {
      201: {
        description: 'Genero creado exitosamente',
        content: {
          'application/json': {
            example: { id: '1', nombre: 'Accion', activo: true },
          },
        },
      },
      401: { description: 'No autorizado' },
      409: { description: 'Ya existe un genero con ese nombre' },
      500: { description: 'Error interno del servidor' },
    },
  })
  async crear(@Body() dto: CreateGeneroDto) {
    const genero = await this.generoService.crearGenero(dto);
    return { ...genero, id: genero.id.toString() };
  }

  @Get()
  @ApiOperation({
    description: 'Obtener todos los generos',
    responses: {
      200: {
        description: 'Lista de generos',
        content: {
          'application/json': {
            example: [{ id: '1', nombre: 'Accion', activo: true }],
          },
        },
      },
      500: { description: 'Error interno del servidor' },
    },
  })
  async getAll() {
    const generos = await this.generoService.getAll();
    return generos.map((g) => ({ ...g, id: g.id.toString() }));
  }

  @Get(':id')
  @ApiOperation({
    description: 'Obtener un genero por su ID',
    responses: {
      200: {
        description: 'Detalle del genero',
        content: {
          'application/json': {
            example: { id: '1', nombre: 'Accion', activo: true },
          },
        },
      },
      404: { description: 'Genero no encontrado' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del genero' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    const genero = await this.generoService.getById(id);
    return { ...genero, id: genero.id.toString() };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Actualizar un genero por su ID',
    responses: {
      200: {
        description: 'Genero actualizado exitosamente',
        content: {
          'application/json': {
            example: { id: '1', nombre: 'Drama', activo: true },
          },
        },
      },
      401: { description: 'No autorizado' },
      404: { description: 'Genero no encontrado' },
      409: { description: 'Ya existe un genero con ese nombre' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del genero a actualizar' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateGeneroDto,
  ) {
    const genero = await this.generoService.update(id, dto);
    return { ...genero, id: genero.id.toString() };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Desactivar un genero por su ID (soft delete)',
    responses: {
      200: {
        description: 'Genero desactivado exitosamente',
        content: {
          'application/json': {
            example: { message: 'Genero con id 1 desactivado exitosamente' },
          },
        },
      },
      401: { description: 'No autorizado' },
      404: { description: 'Genero no encontrado' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del genero a desactivar' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.generoService.delete(id);
  }
}
