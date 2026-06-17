import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuditLogsService } from './audit-logs.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los registros de auditoría con filtros y paginación',
  })
  @ApiQuery({ name: 'accion', required: false, description: 'Filtrar por tipo de acción (parcial)', example: 'CINE_CREADO' })
  @ApiQuery({ name: 'id_usuario', required: false, description: 'Filtrar por ID del usuario afectado', example: 1 })
  @ApiQuery({ name: 'id_auditor', required: false, description: 'Filtrar por ID del auditor', example: 1 })
  @ApiQuery({ name: 'desde', required: false, description: 'Fecha de inicio del rango (ISO 8601)', example: '2024-01-01T00:00:00Z' })
  @ApiQuery({ name: 'hasta', required: false, description: 'Fecha de fin del rango (ISO 8601)', example: '2024-12-31T23:59:59Z' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página (inicia en 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Registros por página', example: 20 })
  @ApiResponse({ status: 200, description: 'Lista paginada de audit logs retornada con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol ADMIN.' })
  findAll(@Query() query: QueryAuditLogsDto) {
    return this.auditLogsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de auditoría por su ID' })
  @ApiParam({ name: 'id', description: 'ID numérico del audit log' })
  @ApiResponse({ status: 200, description: 'Audit log encontrado con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol ADMIN.' })
  @ApiResponse({ status: 404, description: 'Audit log no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditLogsService.findOne(id);
  }
}
