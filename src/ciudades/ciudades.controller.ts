import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CiudadesService } from './ciudades.service';
import { CreateCiudadesDto } from './dto/create-ciudades.dto';

@ApiTags('Ciudades')
@Controller('Ciudades')
export class CiudadesController {
  constructor(private readonly ciudadesService: CiudadesService) {}
  @Get()
  @ApiOperation({
    summary: 'Obtener todas las ciudades',
    description: 'Devuelve una lista de todas las ciudades registradas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ciudades obtenida exitosamente.',
  })
  findAll() {
    return this.ciudadesService.findAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva ciudad',
    description: 'Permite crear una nueva ciudad con los datos proporcionados.',
  })
  @ApiResponse({
    status: 201,
    description: 'Ciudad creada exitosamente.',
  })
  create(@Body() createCiudadesDto: CreateCiudadesDto) {
    return this.ciudadesService.create(createCiudadesDto);
  }
}
