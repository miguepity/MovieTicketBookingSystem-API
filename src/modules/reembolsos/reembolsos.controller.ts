import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ReembolsosService } from './reembolsos.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from 'src/modules/auth/decorators/current-user.decorator';
import { ListReembolsosQueryDto } from './dto/list-reembolsos-query.dto';
import { ProcesarReembolsoDto } from './dto/procesar-reembolso.dto';
import { RechazarReembolsoDto } from './dto/rechazar-reembolso.dto';

@ApiTags('admin/reembolsos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiUnauthorizedResponse({ description: 'No autorizado' })
@ApiForbiddenResponse({ description: 'Rol no autorizado' })
@Controller('admin/reembolsos')
export class ReembolsosController {
  constructor(private readonly reembolsosService: ReembolsosService) {}

  @Get()
  @ApiOperation({ summary: 'Listado paginado de reembolsos (admin)' })
  @ApiOkResponse({ description: 'Página de reembolsos con datos enriquecidos' })
  list(@Query() q: ListReembolsosQueryDto) {
    return this.reembolsosService.findAdminPaginated(q);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs de reembolsos (admin)' })
  @ApiOkResponse({ description: 'Métricas: pendientes, en_procesamiento, monto_pendiente, completados_30d' })
  kpis() {
    return this.reembolsosService.kpis();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un reembolso por ID (admin)' })
  @ApiParam({ name: 'id', description: 'ID numérico del reembolso' })
  @ApiOkResponse({ description: 'Detalle del reembolso' })
  @ApiNotFoundResponse({ description: 'Reembolso no encontrado' })
  one(@Param('id') id: string) {
    return this.reembolsosService.findOneAdmin(BigInt(id));
  }

  @Patch(':id/procesar')
  @ApiOperation({ summary: 'Procesar reembolso pendiente (admin)' })
  @ApiParam({ name: 'id', description: 'ID numérico del reembolso' })
  @ApiOkResponse({ description: 'Reembolso procesado' })
  @ApiNotFoundResponse({ description: 'Reembolso no encontrado' })
  @ApiConflictResponse({ description: 'El reembolso no está en estado pendiente' })
  procesar(
    @Param('id') id: string,
    @Body() dto: ProcesarReembolsoDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reembolsosService.procesar(BigInt(id), dto, BigInt(user.userId));
  }

  @Patch(':id/rechazar')
  @ApiOperation({ summary: 'Rechazar reembolso pendiente (admin)' })
  @ApiParam({ name: 'id', description: 'ID numérico del reembolso' })
  @ApiOkResponse({ description: 'Reembolso rechazado' })
  @ApiNotFoundResponse({ description: 'Reembolso no encontrado' })
  @ApiConflictResponse({ description: 'El reembolso no está en estado pendiente' })
  rechazar(
    @Param('id') id: string,
    @Body() dto: RechazarReembolsoDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reembolsosService.rechazar(BigInt(id), dto, BigInt(user.userId));
  }
}
