import {
  Controller,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Get,
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
@ApiTags('Salas')
@Controller('cines')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  @Post(':id/salas')
  @UseGuards(AuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      asientos: sala.asientos.map((asiento) => ({
        ...asiento,
        id: asiento.id.toString(),
        id_sala: asiento.id_sala.toString(),
      })),
    };
  }
}
