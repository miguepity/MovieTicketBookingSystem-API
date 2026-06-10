import { Controller, Get, Query, StreamableFile, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiProduces, ApiQuery } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { ReporteReservasQueryDto } from './dto/reporte-reservas.dto';
import { ReportePagosQueryDto } from './dto/reporte-pagos.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Admin Reportes')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('reservas/export')
  @ApiOperation({ summary: 'Exportar reporte de reservas en formato CSV' })
  @ApiProduces('text/csv')
  @ApiQuery({ name: 'id_pelicula', required: false, description: 'Filtrar por ID de película', example: '1' })
  @ApiQuery({ name: 'id_cine', required: false, description: 'Filtrar por ID de cine', example: '1' })
  @ApiQuery({ name: 'fecha', required: false, description: 'Filtrar por fecha de función (YYYY-MM-DD)', example: '2026-06-08' })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado de reserva', example: 'CONFIRMADA' })
  @ApiResponse({ status: 200, description: 'Archivo CSV generado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol ADMIN.' })
  async exportarReservasCSV(@Query() query: ReporteReservasQueryDto): Promise<StreamableFile> {
    const csv = await this.reportesService.exportarReservasCSV(query);
    const filename = `reservas-${new Date().toISOString().slice(0, 10)}.csv`;
    return new StreamableFile(Buffer.from(csv, 'utf-8'), {
      type: 'text/csv; charset=utf-8',
      disposition: `attachment; filename="${filename}"`,
    });
  }

  @Get('reservas')
  @ApiOperation({ summary: 'Obtener reporte detallado de reservas con filtros y paginación' })
  async obtenerReporteReservas(@Query() query: ReporteReservasQueryDto) {
    return await this.reportesService.obtenerReporteReservas(query);
  }

  @Get('pagos')
  @ApiOperation({ summary: 'Obtener reporte macro financiero de ingresos y desglose de caja' })
  async obtenerReportePagos(@Query() query: ReportePagosQueryDto) {
    return await this.reportesService.obtenerReportePagos(query);
  }
}
