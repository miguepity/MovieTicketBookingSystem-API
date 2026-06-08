import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
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