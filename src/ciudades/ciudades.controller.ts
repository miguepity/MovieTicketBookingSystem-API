import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CiudadesService } from './ciudades.service';

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
}
