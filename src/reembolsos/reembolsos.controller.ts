import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { ReembolsosService } from './reembolsos.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReembolsoDto } from './dto/create-reembolso.dto';
import { CreateReembolsoEfectivoDto } from './dto/create-reembolso-efectivo.dto';
import { IsRecepcionistaGuard } from 'src/roles/recepcionista.guard';

@ApiTags('Reembolsos')
@Controller('reembolsos')
export class ReembolsosController {
  constructor(private readonly reembolsosService: ReembolsosService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Calcular reembolso para un pago específico',
    responses: {
      201: {
        description: 'Reembolso calculado exitosamente',
        content: {
          'application/json': {
            example: {
              id: 1,
              monto: 150,
              estado: 'procesado',
              fecha_procesado: '2024-06-01T12:00:00.000Z',
              createdAt: '2024-06-01T11:00:00.000Z',
              horas_anticipacion: 48,
              porcentaje_aplicado: 100,
              monto_original: 150,
            },
          },
        },
      },
      400: {
        description:
          'Pago ya reembolsado, funcion ya ocurrio, o no hay politica aplicable',
      },
      401: { description: 'No autorizado' },
      404: { description: 'Pago no encontrado' },
      500: { description: 'Error interno del servidor' },
    },
  })
  async calcularReembolso(@Body() dto: CreateReembolsoDto) {
    return this.reembolsosService.calcularReembolso(dto);
  }

  @Post('efectivo')
  @UseGuards(AuthGuard, IsRecepcionistaGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Registrar reembolso en efectivo y notificar al recepcionista',
    responses: {
      201: {
        description: 'Reembolso en efectivo registrado y notificacion enviada',
        content: {
          'application/json': {
            example: {
              id: '1',
              monto: '150.00',
              estado: 'pendiente_efectivo',
              fecha_procesado: '2026-06-10T00:00:00.000Z',
              created_at: '2026-06-10T00:00:00.000Z',
              horas_antes: 36,
              porcentaje_reembolso: '100.00',
              monto_original: '150.00',
              notificacion_enviada: true,
            },
          },
        },
      },
      400: {
        description:
          'Pago no es efectivo, ya reembolsado, o funcion ya ocurrio',
      },
      401: { description: 'No autorizado' },
      403: {
        description:
          'Acceso denegado: Se requieren privilegios de recepcionista',
      },
      404: { description: 'Pago no encontrado' },
      500: { description: 'Error interno del servidor' },
    },
  })
  async reembolsoEfectivo(@Body() dto: CreateReembolsoEfectivoDto) {
    return this.reembolsosService.reembolsoEfectivo(dto);
  }
}
