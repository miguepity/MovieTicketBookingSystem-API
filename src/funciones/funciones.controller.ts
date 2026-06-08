import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { FuncionesService } from './funciones.service';
import { CreateFuncioneDto } from './dto/create-funcione.dto';
import { ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { BloquearAsientoDto } from './dto/bloquear-asiento.dto';

@ApiTags('Funciones')
@Controller('funciones')
export class FuncionesController {
  constructor(private readonly funcionesService: FuncionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva función' })
  @ApiResponse({
    status: 201,
    description: 'Función creada exitosamente',
    schema: {
      example: {
        id: '1',
        id_pelicula: '1',
        id_sala: '1',
        fecha_hora: '2026-06-07T18:00:00Z',
        estado: 'active',
      },
    },
  })
  async create(@Body() createFuncioneDto: CreateFuncioneDto) {
    const newFuncion = await this.funcionesService.create(createFuncioneDto);
    return {
      ...newFuncion,
      id: newFuncion.id.toString(),
      id_sala: newFuncion.id_sala.toString(),
      id_pelicula: newFuncion.id_pelicula.toString(),
    };
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancela una función' })
  @ApiResponse({
    status: 200,
    description: 'Función cancelada exitosamente',
  })
  async cancel(@Param('id') id: string) {
    return this.funcionesService.cancel(id);
  @Post('/:id/asientos/bloquear')
  @UseGuards(AuthGuard)
  @ApiOperation({
    description: 'Bloquea asientos para una función específica',
    responses: {
      201: {
        description: 'Asiento bloqueado exitosamente',
        content: {
          'application/json': {
            example: {
              id: '1',
              id_asiento: 'A1',
              id_funcion: '1',
              estado: 'blocked',
            },
          },
        },
      },
      400: { description: 'Solicitud inválida' },
      401: { description: 'No autorizado' },
    },
  })
}

  async bloquearAsientos(
    @Body() body: BloquearAsientoDto,
    @Param('id') funcion_id: string,
  ) {
    const asiento = await this.funcionesService.bloquearAsientos(
      BigInt(body.id_asiento),
      BigInt(funcion_id),
    );

    return {
      ...asiento,
      id: asiento.id.toString(),
      id_asiento: asiento.id_asiento.toString(),
      id_funcion: asiento.id_funcion.toString(),
    };
  }

  @Get(':peliculaId/cines/:cineId/funciones')
  @ApiOperation({
    summary: 'Obtener funciones disponibles de una película por cine',
    description:
      'Retorna todas las funciones activas de una película en un cine específico con información de disponibilidad de asientos',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de funciones disponibles con disponibilidad de asientos',
    schema: {
      example: [
        {
          id: '1',
          fecha_hora: '2026-06-15T18:00:00Z',
          sala: {
            id: '1',
            nombre: 'Sala 1',
            filas: 10,
            columnas: 15,
          },
          disponibilidad: {
            total: 150,
            disponibles: 120,
            ocupados: 30,
            porcentaje_disponibilidad: 80,
          },
        },
        {
          id: '2',
          fecha_hora: '2026-06-15T20:00:00Z',
          sala: {
            id: '2',
            nombre: 'Sala 2',
            filas: 12,
            columnas: 18,
          },
          disponibilidad: {
            total: 216,
            disponibles: 50,
            ocupados: 166,
            porcentaje_disponibilidad: 23,
          },
        },
      ],
    },
  })
  @ApiParam({ name: 'peliculaId', description: 'ID de la película' })
  @ApiParam({ name: 'cineId', description: 'ID del cine' })
  @ApiResponse({
    status: 404,
    description: 'Película o cine no encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async getFuncionesPorCine(
    @Param('peliculaId', ParseIntPipe) peliculaId: number,
    @Param('cineId', ParseIntPipe) cineId: number,
  ) {
    return this.funcionesService.getFuncionesPorCine(
      peliculaId.toString(),
      cineId.toString(),
    );
  }
}
