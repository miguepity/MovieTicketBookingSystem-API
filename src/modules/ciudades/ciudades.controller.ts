import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { CiudadesService } from './ciudades.service';
import { CreateCiudadesDto } from './dto/create-ciudades.dto';
import { UpdateCiudadesDto } from './dto/update-ciudades.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

// ─── Primary controller (lowercase path) ─────────────────────────────────────

@ApiTags('Ciudades')
@Controller('ciudades')
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva ciudad',
    description: 'Permite crear una nueva ciudad con los datos proporcionados.',
  })
  @ApiResponse({ status: 201, description: 'Ciudad creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  create(
    @Body() createCiudadesDto: CreateCiudadesDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ciudadesService.create(createCiudadesDto, BigInt(user.userId));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar una ciudad',
    description: 'Permite actualizar los datos de una ciudad existente.',
  })
  @ApiParam({ name: 'id', description: 'ID de la ciudad', example: '1' })
  @ApiResponse({ status: 200, description: 'Ciudad actualizada exitosamente.' })
  @ApiResponse({ status: 400, description: 'ID inválido o datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Ciudad no encontrada.' })
  update(
    @Param('id') id: string,
    @Body() updateCiudadesDto: UpdateCiudadesDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ciudadesService.update(id, updateCiudadesDto, BigInt(user.userId));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar una ciudad (admin)',
    description: 'Elimina una ciudad que no tenga cines asociados.',
  })
  @ApiParam({ name: 'id', description: 'ID de la ciudad', example: '1' })
  @ApiResponse({ status: 200, description: 'Ciudad eliminada exitosamente.' })
  @ApiConflictResponse({ description: 'Ciudad tiene cines asociados.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente.' })
  @ApiResponse({ status: 404, description: 'Ciudad no encontrada.' })
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ciudadesService.delete(BigInt(id), BigInt(user.userId));
  }
}

// ─── Deprecated capital-C alias (kept for one release) ───────────────────────

/**
 * @deprecated Use /ciudades (lowercase) instead.
 * Will be removed in the next major release.
 */
@ApiTags('deprecated')
@Controller('Ciudades')
export class CiudadesDeprecatedController {
  constructor(private readonly ciudadesService: CiudadesService) {}

  @Get()
  @ApiOperation({
    summary: '[Deprecated] Obtener todas las ciudades — use /ciudades',
    deprecated: true,
  })
  @ApiResponse({ status: 200, description: 'Lista de ciudades.' })
  findAll() {
    return this.ciudadesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[Deprecated] Crear ciudad — use /ciudades',
    deprecated: true,
  })
  @ApiResponse({ status: 201, description: 'Ciudad creada.' })
  create(
    @Body() createCiudadesDto: CreateCiudadesDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ciudadesService.create(createCiudadesDto, BigInt(user.userId));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Deprecated] Actualizar ciudad — use /ciudades',
    deprecated: true,
  })
  @ApiParam({ name: 'id', description: 'ID de la ciudad', example: '1' })
  @ApiResponse({ status: 200, description: 'Ciudad actualizada.' })
  update(
    @Param('id') id: string,
    @Body() updateCiudadesDto: UpdateCiudadesDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ciudadesService.update(id, updateCiudadesDto, BigInt(user.userId));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Deprecated] Eliminar ciudad — use /ciudades',
    deprecated: true,
  })
  @ApiParam({ name: 'id', description: 'ID de la ciudad', example: '1' })
  @ApiResponse({ status: 200, description: 'Ciudad eliminada.' })
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ciudadesService.delete(BigInt(id), BigInt(user.userId));
  }
}
