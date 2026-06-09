import { Controller, Post, Body, UseGuards, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CinesService } from './cines.service';
import { CreateCineDto } from './dto/create-cine.dto';
import { AuthGuard } from '../auth/auth.guard';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
@ApiTags('Cines')
@Controller('cines')
export class CinesController {
  constructor(private readonly cinesService: CinesService) {}

  @Post()
  @UseGuards(AuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
}
