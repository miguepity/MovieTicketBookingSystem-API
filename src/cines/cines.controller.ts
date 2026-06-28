import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CinesService } from './cines.service';
import { CreateCineDto } from './dto/create-cine.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateCineDto } from './dto/update-cine.dto';

@ApiTags('Cines')
@Controller('cines')
export class CinesController {
  constructor(private readonly cinesService: CinesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Crear un nuevo cine',
    responses: {
      201: {
        description: 'Cine creado exitosamente',
        content: {
          'application/json': {
            example: {
              id: '1',
              nombre: 'Cinemark',
              direccion: 'Mall Galerias',
              id_ciudad: '1',
              created_at: '2026-06-07T00:00:00.000Z',
            },
          },
        },
      },
      401: { description: 'No autorizado' },
      404: { description: 'Ciudad no encontrada' },
      409: { description: 'Ya existe un cine con ese nombre en esta ciudad' },
      500: { description: 'Error interno del servidor' },
    },
  })
  async crear(@Body() dto: CreateCineDto) {
    const cine = await this.cinesService.crearCine(dto);
    return {
      ...cine,
      id: cine.id.toString(),
      id_ciudad: cine.id_ciudad.toString(),
    };
  }
  @Get(':id')
  @ApiOperation({
    description: 'Obtener detalles de un cine por su ID',
    responses: {
      200: {
        description: 'Detalles del cine',
        content: {
          'application/json': {
            example: {
              id: '1',
              nombre: 'Cinemark',
              direccion: 'Mall Galerias',
              id_ciudad: '1',
              created_at: '2026-06-07T00:00:00.000Z',
              salas: [
                { id: '1', nombre: 'Sala 1', filas: 3, columnas: 4 },
                { id: '2', nombre: 'Sala 2', filas: 5, columnas: 6 },
              ],
            },
          },
        },
      },
      404: { description: 'Cine no encontrado' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del cine' })
  async getCine(@Param('id', ParseIntPipe) id: number) {
    const cine = await this.cinesService.getCine(id);
    return {
      ...cine,
      id: cine.id.toString(),
      id_ciudad: cine.id_ciudad.toString(),
      salas: cine.salas.map((s) => ({
        ...s,
        id: s.id.toString(),
      })),
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Actualizar un cine por su ID',
    responses: {
      200: {
        description: 'Cine actualizado exitosamente',
        content: {
          'application/json': {
            example: {
              id: '1',
              nombre: 'Cine actualizado',
              direccion: 'Direccion actualizada',
              id_ciudad: '1',
              created_at: '2026-06-07T00:00:00.000Z',
            },
          },
        },
      },
      401: { description: 'No autorizado' },
      404: { description: 'Cine no encontrado' },
      409: { description: 'Ya existe un cine con ese nombre en esta ciudad' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del cine a actualizar' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCineDto,
  ) {
    const cine = await this.cinesService.update(id, dto);
    return {
      ...cine,
      id: cine.id.toString(),
      id_ciudad: cine.id_ciudad.toString(),
    };
  }

  @Get()
  @ApiOperation({
    description: 'Obtener todos los cines',
    responses: {
      200: {
        description: 'Lista de cines',
        content: {
          'application/json': {
            example: [
              {
                id: '1',
                nombre: 'Cinemark',
                direccion: 'Mall Galerias',
                id_ciudad: '1',
                created_at: '2026-06-07T00:00:00.000Z',
              },
            ],
          },
        },
      },
      500: { description: 'Error interno del servidor' },
    },
  })
  async getCines() {
    const cines = await this.cinesService.getCines();
    return cines.map((c) => ({
      ...c,
      id: c.id.toString(),
      id_ciudad: c.id_ciudad.toString(),
    }));
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Desactivar un cine por su ID (soft delete)',
    responses: {
      200: {
        description: 'Cine desactivado exitosamente',
        content: {
          'application/json': {
            example: { message: 'Cine con id 1 desactivado exitosamente' },
          },
        },
      },
      401: { description: 'No autorizado' },
      404: { description: 'Cine no encontrado' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del cine a desactivar' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.cinesService.delete(id);
  }

  @Patch(':id/reactivar')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Reactivar un cine desactivado',
    responses: {
      200: {
        description: 'Cine reactivado exitosamente',
        content: {
          'application/json': {
            example: { message: 'Cine con id 1 reactivado exitosamente' },
          },
        },
      },
      400: { description: 'El cine ya está activo' },
      401: { description: 'No autorizado' },
      404: { description: 'Cine no encontrado' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del cine a reactivar' })
  async reactivar(@Param('id', ParseIntPipe) id: number) {
    return this.cinesService.reactivar(id);
  }
}
