import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CiudadesService } from './ciudades.service';
import { CreateCiudadeDto } from './dto/create-ciudade.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('ciudades')
export class CiudadesController {
  constructor(private readonly ciudadesService: CiudadesService) {}

  @ApiOperation({
    description: 'Create a new city',
    responses: {
      201: {
        description: 'City created successfully',
        content: {
          'application/json': {
            example: {
              id: 1,
              nombre: 'San Pedro Sula',
            },
          },
        },
      },
      401: { description: 'Unauthorized' },
    },
  })
  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createCiudadeDto: CreateCiudadeDto) {
    return this.ciudadesService.create(createCiudadeDto);
  }
}
