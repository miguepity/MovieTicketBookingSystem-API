import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './create-reserva.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Módulo de Reservas')
@Controller('reservas')
@ApiBearerAuth('token') 
@UseGuards(JwtAuthGuard) 
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  @ApiOperation({ summary: 'Generar una reserva formal' })
  @ApiResponse({ status: 201, description: 'Reserva creada y asientos apartados en firme.' })
  @ApiResponse({ status: 409, description: 'Conflicto: Uno o más asientos ya fueron adquiridos.' })
  createReserva(@Body() createReservaDto: CreateReservaDto, @Req() req: any) {
    return this.reservasService.createReserva(createReservaDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener listado de reservas' })
  @ApiResponse({ status: 200, description: 'Listado de reservas obtenido con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'No se encontraron reservas para el usuario.' })
  findAll(@Req() req: any) {
    return this.reservasService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de una reserva específica por su ID' })
  @ApiResponse({ status: 200, description: 'Detalle de la reserva encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido: El cliente intenta ver una reserva que no es suya.' })
  @ApiResponse({ status: 404, description: 'La reserva especificada no existe.' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reservasService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar una reserva por su ID' })
  @ApiResponse({ status: 200, description: 'Reserva dada de baja. Asientos reabiertos.' })
  @ApiResponse({ status: 400, description: 'Infracción de política horaria o reserva ya cancelada.' })
  cancelarReserva(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reservasService.cancelarReserva(id, req.user.id);
  }
}