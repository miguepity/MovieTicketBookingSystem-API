import { Post, UseGuards, Body, Controller } from '@nestjs/common';
import { IdiomasService } from './idiomas.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateIdiomaDto } from './dto/create-idioma.dto';

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
            example: {
              id: '1',
              nombre: 'Español',
              created_at: '2026-06-07T00:00:00.000Z',
            },
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
    return {
      ...idioma,
      id: idioma.id.toString(),
    };
  }
}
