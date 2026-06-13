import { Controller, Get, Post, Body, Put, Patch, Param, Delete, ParseIntPipe, UseGuards, Req} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FuncionesService } from './funciones.service';
import { CreateFuncionDto } from './create-funciones.dto';
import { UpdateFuncionDto } from './update-funciones.dto';
import { BloquearAsientosDto } from './bloquear-asientos.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Cartelera de Funciones')
@Controller('funciones')
export class FuncionesController {
  constructor(private readonly funcionesService: FuncionesService) {}

  @Post()
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una función ' })
  @ApiResponse({ status: 201, description: 'Función agendada con éxito.' })
  @ApiResponse({ status: 409, description: 'La sala está ocupada en ese horario.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  create(@Body() createFuncionDto: CreateFuncionDto) {
    return this.funcionesService.create(createFuncionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las funciones vigentes ' })
  @ApiResponse({ status: 200, description: 'Lista de funciones retornada con éxito.' })
  @ApiResponse({ status: 404, description: 'No se encontraron funciones.' })
  findAll() {
    return this.funcionesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una función por su ID' })
  @ApiResponse({ status: 200, description: 'Detalles de la función retornados con éxito.' })
  @ApiResponse({ status: 404, description: 'Función no encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.funcionesService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Modificar una función completa  ' })
  @ApiResponse({ status: 200, description: 'Función modificada con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Función no encontrada.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFuncionDto: UpdateFuncionDto) {
    return this.funcionesService.update(id, updateFuncionDto);
  }

  @Patch(':id/cancelar')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cancelar una función por emergencia, liberando asientos y notificando usuarios' })
  @ApiResponse({ status: 200, description: 'Función dada de baja. Correos emitidos.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Función no encontrada.' })
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.funcionesService.cancelar(id);
  }

  @Post(':id/notificar-cancelacion')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Enviar email masivo a clientes con reservas afectadas por funcion cancelada' })
  @ApiResponse({ status: 201, description: 'Emails de funcion cancelada procesados.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'FunciÃ³n no encontrada.' })
  notifyCancelledFunctionReservations(@Param('id', ParseIntPipe) id: number) {
    return this.funcionesService.notifyCancelledFunctionReservations(id);
  }

  @Delete(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar físicamente una función de la base de datos' })
  @ApiResponse({ status: 200, description: 'Función eliminada con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Función no encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.funcionesService.remove(id);
  } 
  
  @Get(':id/asientos')
  @ApiOperation({ summary: 'Obtener el mapa de ocupación actual de todos los asientos de una función' })
  @ApiResponse({ status: 200, description: 'Mapa de asientos devuelto exitosamente.' })
  @ApiResponse({ status: 404, description: 'La función especificada no existe.' })
  getMapaAsientos(@Param('id', ParseIntPipe) id: number) {
    return this.funcionesService.getMapaAsientos(id);
  }

  @Post(':id/asientos/bloquear')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Bloquear asientos temporalmente en el carrito (Expiración configurable)' })
  @ApiResponse({ status: 201, description: 'Asientos bloqueados temporalmente.' })
  @ApiResponse({ status: 409, description: 'Conflicto: Uno o más asientos ya están tomados por otro usuario.' })
  bloquearAsientos(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BloquearAsientosDto,
    @Req() req: any,
  ) {
    return this.funcionesService.bloquearAsientos(id, req.user.id, dto);
  }
}
