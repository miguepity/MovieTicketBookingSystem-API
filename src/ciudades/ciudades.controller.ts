import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Query,
} from '@nestjs/common';
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
  async create(@Body() createCiudadeDto: CreateCiudadeDto) {
    const city = await this.ciudadesService.create(createCiudadeDto);
    return {
      ...city,
      id: city.id.toString(),
    };
  }

  @Get()
  @ApiOperation({
    description: 'Get all cities',
    responses: {
      200: {
        description: 'List of cities',
        content: {
          'application/json': {
            example: [
              {
                id: '1',
                nombre: 'San Pedro Sula',
              },
              {
                id: '2',
                nombre: 'Tegucigalpa',
              },
            ],
          },
        },
      },
    },
  })
  async findAll() {
    const cities = await this.ciudadesService.findAll();
    return cities.map((city) => ({
      ...city,
      id: city.id.toString(),
    }));
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    description: 'Update a city by ID',
    responses: {
      200: {
        description: 'City updated successfully',
        content: {
          'application/json': {
            example: {
              id: '1',
              nombre: 'San Pedro Sula Updated',
            },
          },
        },
      },
      401: { description: 'Unauthorized' },
      404: { description: 'City not found' },
    },
  })
  async update(
    @Query('id') id: number,
    @Body() updateCiudadeDto: CreateCiudadeDto,
  ) {
    const city = await this.ciudadesService.update(id, updateCiudadeDto);
    return {
      ...city,
      id: city.id.toString(),
    };
  }
}
