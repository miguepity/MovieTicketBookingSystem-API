import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { AuthGuard } from '../auth/auth.guard';

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
}
