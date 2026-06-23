import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ReportesService } from './reportes.service';
import { ListReporteReservasQueryDto } from './dto/list-reportes-reservas-query.dto';
import { ListReportePagosQueryDto } from './dto/list-reportes-pagos-query.dto';
import { ReportesReservasPageResponseDto } from './dto/reportes-reservas-page.response.dto';
import { ReportesPagosPageResponseDto } from './dto/reportes-pagos-page.response.dto';

@ApiTags('Reportes Administrativos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiUnauthorizedResponse({ description: 'No autorizado' })
@ApiForbiddenResponse({ description: 'Rol no autorizado' })
@Controller('admin/reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('reservas')
  @ApiOperation({ summary: 'Listar reservas con filtros y paginación' })
  @ApiOkResponse({ type: ReportesReservasPageResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  findAllReservas(
    @Query() query: ListReporteReservasQueryDto,
  ): Promise<ReportesReservasPageResponseDto> {
    return this.reportesService.findAllReservas(query);
  }

  @Get('reservas/export')
  @ApiOperation({ summary: 'Exportar reservas filtradas a CSV' })
  @ApiOkResponse({ description: 'Archivo CSV de reservas' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async exportarReservas(
    @Query() query: ListReporteReservasQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const csv = await this.reportesService.exportarReservas(query);

    const filename = `reservas-${new Date()
      .toISOString()
      .replace(/[:.]/g, '-')}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return csv;
  }

  @Get('pagos')
  @ApiOperation({ summary: 'Historial de pagos y reembolsos' })
  @ApiOkResponse({ type: ReportesPagosPageResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  historialPagos(
    @Query() query: ListReportePagosQueryDto,
  ): Promise<ReportesPagosPageResponseDto> {
    return this.reportesService.historialPagos(query);
  }
}
