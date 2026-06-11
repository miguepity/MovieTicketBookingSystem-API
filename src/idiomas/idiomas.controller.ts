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
import { CreateIdiomaDto } from './dto/create-idioma.dto';
import { IdiomasService } from './idiomas.service';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Idiomas')
@Controller('idiomas')
export class IdiomasController {
  constructor(private readonly idiomasService: IdiomasService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Crear un nuevo idioma',
    responses: {
      201: {
        description: 'Idioma creado exitosamente',
        content: {
          'application/json': {
            example: { id: '1', nombre: 'Español', activo: true },
          },
        },
      },
      401: { description: 'No autorizado' },
      409: { description: 'Ya existe un idioma con ese nombre' },
      500: { description: 'Error interno del servidor' },
    },
  })
  async create(@Body() dto: CreateIdiomaDto) {
    const idioma = await this.idiomasService.create(dto);
    return { ...idioma, id: idioma.id.toString() };
  }

  @Get()
  @ApiOperation({
    description: 'Obtener todos los idiomas',
    responses: {
      200: {
        description: 'Lista de idiomas',
        content: {
          'application/json': {
            example: [{ id: '1', nombre: 'Español', activo: true }],
          },
        },
      },
      500: { description: 'Error interno del servidor' },
    },
  })
  async getAll() {
    const idiomas = await this.idiomasService.getAll();
    return idiomas.map((i) => ({ ...i, id: i.id.toString() }));
  }

  @Get(':id')
  @ApiOperation({
    description: 'Obtener un idioma por su ID',
    responses: {
      200: {
        description: 'Detalle del idioma',
        content: {
          'application/json': {
            example: { id: '1', nombre: 'Español', activo: true },
          },
        },
      },
      404: { description: 'Idioma no encontrado' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del idioma' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    const idioma = await this.idiomasService.getById(id);
    return { ...idioma, id: idioma.id.toString() };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Actualizar un idioma por su ID',
    responses: {
      200: {
        description: 'Idioma actualizado exitosamente',
        content: {
          'application/json': {
            example: { id: '1', nombre: 'Ingles', activo: true },
          },
        },
      },
      401: { description: 'No autorizado' },
      404: { description: 'Idioma no encontrado' },
      409: { description: 'Ya existe un idioma con ese nombre' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del idioma a actualizar' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateIdiomaDto,
  ) {
    const idioma = await this.idiomasService.update(id, dto);
    return { ...idioma, id: idioma.id.toString() };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Desactivar un idioma por su ID (soft delete)',
    responses: {
      200: {
        description: 'Idioma desactivado exitosamente',
        content: {
          'application/json': {
            example: { message: 'Idioma con id 1 desactivado exitosamente' },
          },
        },
      },
      401: { description: 'No autorizado' },
      404: { description: 'Idioma no encontrado' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del idioma a desactivar' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.idiomasService.delete(id);
  }
}
