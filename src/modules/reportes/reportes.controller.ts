import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { ListReporteReservasQueryDto } from './dto/list-reportes-query.dto';

@ApiTags('Reportes Administrativos')
@Controller('admin/reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('reservas')
  @ApiOperation({ summary: 'Obtener todas las reservas' })
  @ApiOkResponse({ description: 'Lista de reservas obtenida exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  findAllReservas(@Query() query: ListReporteReservasQueryDto,) {
    return this.reportesService.findAllReservas(query);
  }

  @Get('reservas/export')
  @ApiOperation({ summary: 'Exportar reservas' })
  @ApiOkResponse({ description: 'Reservas exportadas exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  exportarReservas() {
    return this.reportesService.exportarReservas();
  }

}

