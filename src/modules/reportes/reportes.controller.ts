import { Controller, Get, NotFoundException, Query, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportesService } from './reportes.service';
import { ListReporteReservasQueryDto } from './dto/list-reportes-reservas-query.dto';
import { ListReportePagosQueryDto } from './dto/list-reportes-pagos-query.dto';
import { ReportesReservasPageResponseDto } from './dto/reportes-reservas-page.response.dto';
import { ReportesPagosPageResponseDto } from './dto/reportes-pagos-page.response.dto';

@ApiTags('Reportes Administrativos')
@Controller('admin/reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('reservas')
  @ApiOperation({ summary: 'Obtener todas las reservas' })
  @ApiOkResponse({ description: 'Lista de reservas obtenida exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse ({ description: 'No se encontraron reservas' })
  findAllReservas(@Query() query: ListReporteReservasQueryDto): Promise<ReportesReservasPageResponseDto> {
    return this.reportesService.findAllReservas(query);
  }

  @Get('reservas/export')
  @ApiOperation({ summary: 'Exportar reservas' })
  @ApiOkResponse({ description: 'Reservas exportadas exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async exportarReservas(
    @Query() query: ListReporteReservasQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const csv = await this.reportesService.exportarReservas(query);
    if (!csv?.trim()) {
      throw new NotFoundException('No reservations found for export');
    }

    const date = new Date().toISOString();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reservas-${date}.csv`,
    );

    return csv;
  }

  @Get('pagos')
  @ApiOperation({ summary: 'Historial de pagos y reembolsos' })
  @ApiOkResponse({ description: 'Historial de pagos obtenido exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse ({ description: 'No se encontraron pagos' })
  historialPagos(@Query() query: ListReportePagosQueryDto): Promise<ReportesPagosPageResponseDto> {
    return this.reportesService.historialPagos(query);
  }
}
