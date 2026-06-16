import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CiudadesService } from './ciudades.service';
import { CreateCiudadesDto } from './dto/create-ciudades.dto';
import { UpdateCiudadesDto } from './dto/update-ciudades.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear una nueva ciudad',
    description: 'Permite crear una nueva ciudad con los datos proporcionados.',
  })
  @ApiResponse({
    status: 201,
    description: 'Ciudad creada exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  create(
    @Body() createCiudadesDto: CreateCiudadesDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ciudadesService.create(createCiudadesDto, BigInt(user.userId));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar una ciudad',
    description: 'Permite actualizar los datos de una ciudad existente.',
  })
  @ApiParam({ name: 'id', description: 'ID de la ciudad', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Ciudad actualizada exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'ID inválido o datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Ciudad no encontrada.' })
  update(
    @Param('id') id: string,
    @Body() updateCiudadesDto: UpdateCiudadesDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ciudadesService.update(
      id,
      updateCiudadesDto,
      BigInt(user.userId),
    );
  }
}
