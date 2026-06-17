import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
  Patch,
} from '@nestjs/common';
import { SalaService } from './sala.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CambiarEstadoAsientoDto } from './dto/cambiar-estado-asiento.dto';

@ApiTags('salas')
@Controller('salas')
export class SalaController {
  constructor(private readonly salaService: SalaService) {}

  @Get('asientos')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener el listado global de TODOS los asientos de todos los cines y salas (Admin)' })
  @ApiResponse({ status: 200, description: 'Inventario global de asientos recuperado con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido: Solo los administradores pueden acceder a este recurso.' })
  getAllAsientosGlobal() {
    return this.salaService.findAllAsientos();
  }

  @Post()
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva sala (genera asientos automáticamente)' })
  @ApiResponse({ status: 201, description: 'La sala ha sido creada exitosamente con sus asientos.' })
  @ApiResponse({ status: 404, description: 'Cine no encontrado.' })
  create(@Body() createSalaDto: CreateSalaDto,
    @Req() req: any) {
    return this.salaService.create(createSalaDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las salas' })
  @ApiResponse({ status: 200, description: 'Lista de salas retornada con éxito.' })
  findAll() {
    return this.salaService.findAll();
  }

  @Get(':id/asientos')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Roles('ADMIN', 'CLIENTE')
  @ApiOperation({ summary: 'Obtener el mapa de asientos físicos de una sala' })
  @ApiResponse({ status: 200, description: 'Mapa de asientos de la sala recuperado con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Sala no encontrada.' })
  @ApiParam({ name: 'id', description: 'ID numérico de la sala' })
  getAsientos(@Param('id', ParseIntPipe) id: number) {
    return this.salaService.getAsientosPorSala(id);
  }

  @Patch(':id/asientos/:idAsiento/estado')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Activar/Desactivar un asiento por daño físico (Alternar entre ESTANDAR y MANTENIMIENTO)' })
  @ApiResponse({ status: 200, description: 'Estado del asiento actualizado con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Sala o asiento no encontrado.' })
  @ApiParam({ name: 'id', description: 'ID numérico de la sala' })
  @ApiParam({ name: 'idAsiento', description: 'ID numérico del asiento a modificar' })
  cambiarEstadoAsiento(
    @Param('id', ParseIntPipe) id: number,
    @Param('idAsiento', ParseIntPipe) idAsiento: number,
    @Body() dto: CambiarEstadoAsientoDto
  ) {
    return this.salaService.cambiarEstadoFisicoAsiento(id, idAsiento, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sala por su ID' })
  @ApiResponse({ status: 200, description: 'Sala encontrada con éxito.' })
  @ApiResponse({ status: 404, description: 'Sala no encontrada.' })
  @ApiParam({ name: 'id', description: 'ID numérico de la sala' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salaService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Modificar una sala existente' })
  @ApiResponse({ status: 200, description: 'La sala ha sido modificada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Sala o Cine no encontrado.' })
  @ApiParam({ name: 'id', description: 'ID numérico de la sala a modificar' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalaDto: UpdateSalaDto,
    @Req() req: any,
  ) {
    return this.salaService.update(id, updateSalaDto, req.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una sala por ID' })
  @ApiResponse({ status: 200, description: 'Sala eliminada con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Sala no encontrada.' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar (tiene funciones asociadas).' })
  @ApiParam({ name: 'id', description: 'ID de la sala a eliminar' })
  remove(@Param('id', ParseIntPipe) id: number,
    @Req() req: any) {
    return this.salaService.remove(id, req.user.id);
  }
}