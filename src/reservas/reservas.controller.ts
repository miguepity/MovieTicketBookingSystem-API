import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Reservas')
@Controller('reservas')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva reserva de asientos' })
  @ApiResponse({
    status: 201,
    description: 'Reserva creada exitosamente',
    schema: {
      example: {
        id: '1',
        numero_reserva: 'RES-ABC1234567',
        id_usuario: '1',
        id_funcion: '1',
        estado: 'pendiente',
        created_at: '2026-06-08T12:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Asientos no disponibles' })
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservasService.create(createReservaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las reservas' })
  @ApiResponse({ status: 200, description: 'Lista de reservas obtenida' })
  findAll() {
    return this.reservasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una reserva por ID' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  @ApiResponse({ status: 200, description: 'Detalle de la reserva' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar el estado de una reserva' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  @ApiResponse({ status: 200, description: 'Reserva actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservaDto: UpdateReservaDto,
  ) {
    return this.reservasService.update(id, updateReservaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una reserva y liberar asientos' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  @ApiResponse({
    status: 200,
    description: 'Reserva eliminada y asientos liberados',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.remove(id);
  }

  @Post(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar una reserva y liberar asientos' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  @ApiResponse({
    status: 200,
    description: 'Reserva cancelada y asientos liberados',
  })
  cancelar(@Param('id', ParseIntPipe) id: bigint) {
    return this.reservasService.cancelar(id);
  }
}
