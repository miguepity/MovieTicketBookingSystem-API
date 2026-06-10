import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
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
      500: { description: 'Error interno del servidor' },
    },
  })
  async crear(@Body() dto: CreateGeneroDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const genero = await this.generoService.crearGenero(dto);
    return {
      ...genero,
      id: genero.id.toString(),
    };
  }
}
