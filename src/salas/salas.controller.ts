import {
  Controller,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Get,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SalasService } from './salas.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateSalaDto } from './dto/update-sala.dto';

@ApiTags('Salas')
@Controller('cines')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  @Post(':id/salas')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description:
      'Crear una sala en un cine con generacion automatica de asientos',
    responses: {
      201: {
        description: 'Sala creada exitosamente',
        content: {
          'application/json': {
            example: {
              id: '1',
              nombre: 'Sala 1',
              filas: 3,
              columnas: 4,
              id_cine: '1',
              asientos_generados: 12,
            },
          },
        },
      },
      400: { description: 'Debe ingresar todos los datos solicitados' },
      401: { description: 'No autorizado' },
      404: { description: 'Cine no encontrado' },
      409: { description: 'Ya existe una sala con ese nombre en este cine' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del cine' })
  async crear(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSalaDto,
  ) {
    const sala = await this.salasService.crearSala(id, dto);
    return {
      ...sala,
      id: sala.id.toString(),
      id_cine: sala.id_cine.toString(),
    };
  }

  @Get('salas/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Obtener detalles de una sala por su ID',
    responses: {
      200: {
        description: 'Detalles de la sala',
        content: {
          'application/json': {
            example: {
              id: '1',
              nombre: 'Sala 1',
              filas: 3,
              columnas: 4,
              id_cine: '1',
              asientos: [
                {
                  id: '1',
                  fila: 1,
                  columna: 1,
                  id_sala: '1',
                },
                {
                  id: '2',
                  fila: 1,
                  columna: 2,
                  id_sala: '1',
                },
                {
                  id: '3',
                  fila: 1,
                  columna: 3,
                  id_sala: '1',
                },
                {
                  id: '4',
                  fila: 1,
                  columna: 4,
                  id_sala: '1',
                },
                {
                  id: '5',
                  fila: 2,
                  columna: 1,
                  id_sala: '1',
                },
                {
                  id: '6',
                  fila: 2,
                  columna: 2,
                  id_sala: '1',
                },
              ],
            },
          },
        },
      },
      404: { description: 'Sala no encontrada' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID de la sala' })
  async getSala(@Param('id', ParseIntPipe) id: number) {
    const sala = await this.salasService.getSala(id);
    return {
      ...sala,
      id: sala.id.toString(),
      id_cine: sala.id_cine.toString(),
      asientos: sala.asientos.map((asiento) => ({
        ...asiento,
        id: asiento.id.toString(),
        id_sala: asiento.id_sala.toString(),
      })),
    };
  }

  @Get('salas')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Obtener todas las salas de un cine',
    responses: {
      200: {
        description: 'Lista de salas',
        content: {
          'application/json': {
            example: [
              {
                id: '1',
                nombre: 'Sala 1',
                filas: 3,
                columnas: 4,
                id_cine: '1',
              },
              {
                id: '2',
                nombre: 'Sala 2',
                filas: 5,
                columnas: 6,
                id_cine: '1',
              },
            ],
          },
        },
      },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID del cine' })
  async getSalas(@Param('id', ParseIntPipe) id?: number) {
    const salas = await this.salasService.getSalas(id);
    return salas.map((s) => ({
      ...s,
      id: s.id.toString(),
      id_cine: s.id_cine.toString(),
    }));
  }

  @Put('salas/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Actualizar una sala por su ID',
    responses: {
      200: {
        description: 'Sala actualizada exitosamente',
        content: {
          'application/json': {
            example: {
              id: '1',
              nombre: 'Sala VIP',
              filas: 5,
              columnas: 10,
              id_cine: '1',
              advertencia: 'Esta sala tiene 2 funcion(es) activa(s)',
            },
          },
        },
      },
      400: { description: 'Datos inválidos' },
      401: { description: 'No autorizado' },
      404: { description: 'Sala no encontrada' },
      409: { description: 'Ya existe una sala con ese nombre en este cine' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID de la sala a actualizar' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSalaDto,
  ) {
    const sala = await this.salasService.update(id, dto);
    return {
      ...sala,
      id: sala.id.toString(),
      id_cine: sala.id_cine.toString(),
    };
  }

  @Delete('salas/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Eliminar una sala por su ID',
    responses: {
      200: { description: 'Sala eliminada exitosamente' },
      401: { description: 'No autorizado' },
      404: { description: 'Sala no encontrada' },
      500: { description: 'Error interno del servidor' },
    },
  })
  @ApiParam({ name: 'id', description: 'ID de la sala a eliminar' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.salasService.delete(id);
    return { message: 'Sala eliminada exitosamente' };
  }
}
