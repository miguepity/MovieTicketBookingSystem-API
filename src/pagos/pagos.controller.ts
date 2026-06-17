import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PagosService } from './pagos.service';
import { CreatePagosDto } from './dtos/create-pagos.dto';
import { CreatePagoEfectivoDto } from './dtos/create-pagos-efectivo.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Pagos')
@Controller('pagos')
@ApiBearerAuth('token')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @ApiOperation({ summary: 'Procesar pago de una reserva' })
  @ApiResponse({ status: 201, description: 'Pago procesado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error al procesar el pago.' })
  @ApiResponse({ status: 404, description: 'La reserva no existe.' })
  async crearPago(
    @Body() createPagoDto: CreatePagosDto,
    @Req() req: any,
  ) {
    const auditorId: number | undefined = req.user?.id;
    return await this.pagosService.procesarPago(createPagoDto, auditorId);
  }

  @Post('efectivo')
  @ApiOperation({ summary: 'Procesar pago de una reserva en efectivo' })
  @ApiResponse({ status: 201, description: 'Pago procesado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error al procesar el pago.' })
  @ApiResponse({ status: 404, description: 'La reserva no existe.' })
  @ApiResponse({ status: 409, description: 'La reserva ya ha sido pagada.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPCIONISTA', 'ADMIN')
  async crearPagoEfectivo(
    @Body() createPagoEfectivoDto: CreatePagoEfectivoDto,
    @CurrentUser('id') auditorId: number,
  ) {
    return await this.pagosService.procesarPagoEfectivo(createPagoEfectivoDto, auditorId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los pagos' })
  @ApiResponse({ status: 200, description: 'Lista de pagos obtenida exitosamente.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async obtenerPagos() {
    return await this.pagosService.obtenerPagos();
  }

  @Get('reserva/:id_reserva')
  @ApiOperation({ summary: 'Obtener un pago por su ID de reserva' })
  @ApiResponse({ status: 200, description: 'Pago obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'El pago no existe.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async obtenerPago(@Param('id_reserva') id_reserva: string) {
    return await this.pagosService.obtenerPagoPorReserva(id_reserva);
  }
}
