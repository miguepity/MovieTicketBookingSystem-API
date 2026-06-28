import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { CiudadesService } from './ciudades.service';
import { CreateCiudadeDto } from './dto/create-ciudade.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Ciudades')
@Controller('ciudades')
export class CiudadesController {
  constructor(private readonly ciudadesService: CiudadesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva ciudad' })
  @ApiResponse({
    status: 201,
    description: 'Ciudad creada exitosamente',
    schema: {
      example: {
        id: '1',
        nombre: 'San Pedro Sula',
      },
    },
  })
  async create(@Body() createCiudadeDto: CreateCiudadeDto) {
    const city = await this.ciudadesService.create(createCiudadeDto);
    return {
      ...city,
      id: city.id.toString(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las ciudades' })
  @ApiResponse({
    status: 200,
    description: 'Lista de ciudades',
    schema: {
      example: [
        { id: '1', nombre: 'San Pedro Sula' },
        { id: '2', nombre: 'Tegucigalpa' },
      ],
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una ciudad por ID' })
  @ApiResponse({
    status: 200,
    description: 'Ciudad actualizada exitosamente',
    schema: {
      example: {
        id: '1',
        nombre: 'San Pedro Sula Updated',
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCiudadeDto: CreateCiudadeDto,
  ) {
    const city = await this.ciudadesService.update(id, updateCiudadeDto);
    return {
      ...city,
      id: city.id.toString(),
    };
  }
  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar una ciudad por ID (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Ciudad desactivada exitosamente',
    schema: {
      example: { message: 'Ciudad con id 1 desactivada exitosamente' },
    },
  })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.ciudadesService.delete(id);
  }

  @Patch(':id/reactivar')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reactivar una ciudad desactivada' })
  @ApiResponse({
    status: 200,
    description: 'Ciudad reactivada exitosamente',
    schema: {
      example: { message: 'Ciudad con id 1 reactivada exitosamente' },
    },
  })
  async reactivar(@Param('id', ParseIntPipe) id: number) {
    return this.ciudadesService.reactivar(id);
  }
}
