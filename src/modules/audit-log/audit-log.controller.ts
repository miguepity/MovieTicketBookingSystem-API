import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditLogService } from './audit-log.service';
import { AuditLogDetailResponseDto } from './dto/audit-log-detail.response.dto';
import { AuditLogListResponseDto } from './dto/audit-log-item.response.dto';
import { ListAuditLogQueryDto } from './dto/list-audit-log.query.dto';

@ApiTags('Audit Log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiUnauthorizedResponse({ description: 'No autorizado' })
@ApiForbiddenResponse({ description: 'Rol no autorizado' })
@Controller('admin/audit-log')
export class AuditLogController {
  constructor(private readonly auditLog: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'Lista paginada de entradas del audit log' })
  @ApiOkResponse({ type: AuditLogListResponseDto })
  list(@Query() q: ListAuditLogQueryDto): Promise<AuditLogListResponseDto> {
    return this.auditLog.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una entrada del audit log con snapshots' })
  @ApiOkResponse({ type: AuditLogDetailResponseDto })
  @ApiNotFoundResponse({ description: 'Entrada no encontrada' })
  getById(@Param('id') id: string): Promise<AuditLogDetailResponseDto> {
    return this.auditLog.getById(id);
  }
}
