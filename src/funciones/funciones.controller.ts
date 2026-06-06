import { Controller, Post, Body } from '@nestjs/common';
import { FuncionesService } from './funciones.service';
import { CreateFuncioneDto } from './dto/create-funcione.dto';
import { ApiOperation } from '@nestjs/swagger';
@Controller('funciones')
export class FuncionesController {
  constructor(private readonly funcionesService: FuncionesService) {}

  @Post()
  @ApiOperation({
    description: 'Crea una nueva función',
    responses: {
      201: {
        description: 'Función creada exitosamente',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id_pelicula: { type: 'string' },
                id_sala: { type: 'string' },
                fecha_hora: { type: 'string', format: 'date-time' },
                precio: { type: 'number' },
              },
            },
          },
        },
      },
      400: {
        description: 'Solicitud inválida',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number' },
                message: { type: 'string' },
                error: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  create(@Body() createFuncioneDto: CreateFuncioneDto) {
    return this.funcionesService.create(createFuncioneDto);
  }
}
