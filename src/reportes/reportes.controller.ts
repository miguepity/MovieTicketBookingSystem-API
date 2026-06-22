import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { ReporteReservasDto } from './dto/reporte-reservas.dto';
import { ReportePagosDto } from './dto/reporte-pagos.dto';
import { AuthGuard } from '../auth/auth.guard';
import { IsAdminGuard } from '../roles/admin.guard';

@ApiTags('Reportes')
@Controller('admin/reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('reservas')
  @UseGuards(AuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Reporte de reservas con filtros y paginacion - Solo admin',
    responses: {
      200: {
        description: 'Reporte generado exitosamente',
        content: {
          'application/json': {
            example: {
              total: 50,
              pagina: 1,
              limite: 10,
              total_paginas: 5,
              data: [
                {
                  id: '1',
                  numero_reserva: 'RES-ABC123',
                  estado: 'pagada',
                  created_at: '2026-06-01T00:00:00.000Z',
                  updated_at: '2026-06-01T00:00:00.000Z',
                  total_asientos: 2,
                  usuario: {
                    id: '1',
                    nombre: 'Juan Perez',
                    email: 'juan@test.com',
                  },
                  funcion: {
                    id: '1',
                    fecha_hora: '2026-12-01T20:00:00.000Z',
                    estado: 'active',
                    pelicula: { id: '1', titulo: 'Avatar' },
                    sala: {
                      id: '1',
                      nombre: 'Sala 1',
                      cine: { id: '1', nombre: 'Cinemark' },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      401: { description: 'No autorizado' },
      403: { description: 'Acceso denegado: Solo administradores' },
      500: { description: 'Error interno del servidor' },
    },
  })
  async reporteReservas(@Query() dto: ReporteReservasDto) {
    return this.reportesService.reporteReservas(dto);
  }

  @Get('pagos')
  @UseGuards(AuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Reporte de pagos con filtros y paginacion - Solo admin',
    responses: {
      200: {
        description: 'Reporte generado exitosamente',
        content: {
          'application/json': {
            example: {
              total: 50,
              pagina: 1,
              limite: 10,
              total_paginas: 5,
              data: [
                {
                  id: '1',
                  monto_original: '150.00',
                  monto_descuento: '15.00',
                  monto_final: '135.00',
                  metodo: 'tarjeta',
                  estado: 'completado',
                  referencia_externa: 'REF-123',
                  created_at: '2026-06-01T00:00:00.000Z',
                  reserva: {
                    id: '1',
                    numero_reserva: 'RES-ABC123',
                    usuario: {
                      id: '1',
                      nombre: 'Juan Perez',
                      email: 'juan@test.com',
                    },
                    funcion: {
                      id: '1',
                      fecha_hora: '2026-12-01T20:00:00.000Z',
                      pelicula: { id: '1', titulo: 'Avatar' },
                      sala: {
                        id: '1',
                        nombre: 'Sala 1',
                        cine: { id: '1', nombre: 'Cinemark' },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      401: { description: 'No autorizado' },
      403: { description: 'Acceso denegado: Solo administradores' },
      500: { description: 'Error interno del servidor' },
    },
  })
  async reportePagos(@Query() dto: ReportePagosDto) {
    return this.reportesService.reportePagos(dto);
  }
}
