import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import { ReservasService } from './reservas.service';
import { ReservasBodyDto } from './dto/reservas.body.dto';
import { ReservasFilterDto } from './dto/reservas.filter.dto';

@ApiTags('Reservas')
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar reservas con filtros opcionales' })
  getReservas(@Query() dto: ReservasFilterDto) {
    return this.reservasService.getReservas(dto);
  }

  @Get('export')
  @ApiOperation({ summary: 'Exportar reservas' })
  exportReservas() {
    return this.reservasService.exportReservas();
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  getReservaById(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.getReservaById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una reserva' })
  createReserva(@Body() dto: ReservasBodyDto) {
    return this.reservasService.createReserva(dto);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar una reserva' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  cancelReserva(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.cancelarReserva(id);
  }
}
