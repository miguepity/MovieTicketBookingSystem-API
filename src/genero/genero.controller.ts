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
import { ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { GeneroService } from './genero.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('genero')
export class GeneroController {
  constructor(private readonly generoService: GeneroService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Crear un nuevo género',
    responses: {
      201: {
        description: 'Género creado exitosamente',
        content: {
          'application/json': {
            example: {
              id: '1',
              nombre: 'Acción',
              descripcion: 'Películas de acción con mucha adrenalina',
              created_at: '2026-06-07T00:00:00.000Z',
            },
          },
        },
      },
      401: { description: 'No autorizado' },
      409: { description: 'Ya existe un género con ese nombre' },
      500: { description: 'Error interno del servidor' },
    },
  })
  async crear(@Body() dto: CreateGeneroDto) {
    const genero = await this.generoService.crearGenero(dto);
    return {
      ...genero,
      id: genero.id.toString(),
    };
  }

  @Get()
  @ApiOperation({
    description: 'Obtener todos los géneros activos',
    responses: {
      200: {
        description: 'Lista de géneros',
        content: {
          'application/json': {
            example: [
              { id: '1', nombre: 'Acción', activo: true },
              { id: '2', nombre: 'Comedia', activo: true },
            ],
          },
        },
      },
      404: { description: 'Arreglo vacio' },
      500: { description: 'Error interno del servidor' },
    },
  })
  async getAll() {
    const generos = await this.generoService.getAll();
    return generos.map((g) => ({
      ...g,
      id: g.id.toString(),
    }));
  }

  @Get(':id')
  @ApiOperation({
    description: 'Obtener un género por su ID',
    responses: {
      200: {
        description: 'Detalle del género',
        content: {
          'application/json': {
            example: { id: '1', nombre: 'Acción', activo: true },
          },
        },
      },
      404: { description: 'Género no encontrado' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del género' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    const genero = await this.generoService.getById(id);
    return {
      ...genero,
      id: genero.id.toString(),
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Actualizar un género por su ID',
    responses: {
      200: {
        description: 'Género actualizado exitosamente',
        content: {
          'application/json': {
            example: {
              id: '1',
              nombre: 'Acción actualizada',
              descripcion: 'Descripción actualizada',
              activo: true,
            },
          },
        },
      },
      401: { description: 'No autorizado' },
      404: { description: 'Género no encontrado' },
      409: { description: 'Ya existe un género con ese nombre' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del género a actualizar' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateGeneroDto,
  ) {
    const genero = await this.generoService.update(id, dto);
    return {
      ...genero,
      id: genero.id.toString(),
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Desactivar un género por su ID (soft delete)',
    responses: {
      200: {
        description: 'Género desactivado exitosamente',
        content: {
          'application/json': {
            example: { message: 'Género con id 1 desactivado exitosamente' },
          },
        },
      },
      401: { description: 'No autorizado' },
      404: { description: 'Género no encontrado' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del género a desactivar' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.generoService.delete(id);
  }
}
