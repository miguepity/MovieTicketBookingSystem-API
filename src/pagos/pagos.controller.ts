import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CreatePagoEfectivoDto } from './dto/create-pago-efectivo.dto';
import { IsRecepcionistaGuard } from '../roles/recepcionista.guard';

@ApiTags('Pagos')
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Procesar un pago y actualizar estado de reserva a pagada',
    responses: {
      201: {
        description: 'Pago procesado exitosamente',
        content: {
          'application/json': {
            example: {
              id: '1',
              monto_original: '300.00',
              monto_descuento: '0.00',
              monto_final: '300.00',
              metodo: 'tarjeta',
              estado: 'completado',
              referencia_externa: null,
              created_at: '2026-06-09T00:00:00.000Z',
            },
          },
        },
      },
      400: { description: 'Reserva ya pagada o cancelada, o cupon invalido' },
      401: { description: 'No autorizado' },
      404: { description: 'Reserva o cupon no encontrado' },
      500: { description: 'Error interno del servidor' },
    },
  })
  async procesarPago(@Body() dto: CreatePagoDto) {
    return this.pagosService.procesarPago(dto);
  }

  @Post('efectivo')
  @UseGuards(AuthGuard, IsRecepcionistaGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description:
      'Confirmar pago en efectivo de una reserva - Solo recepcionista',
    responses: {
      201: {
        description: 'Pago en efectivo confirmado exitosamente',
        content: {
          'application/json': {
            example: {
              id: '1',
              monto_original: '300.00',
              monto_descuento: '0.00',
              monto_final: '300.00',
              metodo: 'efectivo',
              estado: 'completado',
              created_at: '2026-06-10T00:00:00.000Z',
            },
          },
        },
      },
      400: { description: 'Reserva ya pagada o cancelada' },
      401: { description: 'No autorizado' },
      403: {
        description:
          'Acceso denegado: Se requieren privilegios de recepcionista',
      },
      404: { description: 'Reserva no encontrada' },
      500: { description: 'Error interno del servidor' },
    },
  })
  async pagoEfectivo(@Body() dto: CreatePagoEfectivoDto) {
    return this.pagosService.procesarPagoEfectivo(dto);
  }
}
