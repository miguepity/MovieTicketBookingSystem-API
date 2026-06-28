import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ListClientesQueryDto } from './dto/list-clientes-query.dto';
import { UpdateClienteEstadoDto } from './dto/update-cliente-estado.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { ClientesPageResponseDto } from './dto/clientes-page-response.dto';
import { ClientesStatsResponseDto } from './dto/clientes-stats-response.dto';
import { ClienteDetalleResponseDto } from './dto/cliente-detalle-response.dto';
import { ClienteListItemDto } from './dto/cliente-list-item.dto';

@ApiTags('Admin Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/clientes')
export class AdminClientesController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes paginado con filtros opcionales' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de clientes.',
    type: ClientesPageResponseDto,
  })
  list(@Query() q: ListClientesQueryDto) {
    return this.users.findClientesPaginated(q);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Conteos globales de clientes (total, activos, bloqueados)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de clientes.',
    type: ClientesStatsResponseDto,
  })
  stats() {
    return this.users.findClientesStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de cliente con últimas 10 reservas' })
  @ApiResponse({
    status: 200,
    description: 'Detalle del cliente incluyendo sus últimas 10 reservas.',
    type: ClienteDetalleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  one(@Param('id') id: string) {
    return this.users.findClienteById(BigInt(id));
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de cliente (activo/bloqueado)' })
  @ApiResponse({
    status: 200,
    description: 'Estado del cliente actualizado. Devuelve los datos del cliente.',
    type: ClienteListItemDto,
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  setEstado(
    @Param('id') id: string,
    @Body() dto: UpdateClienteEstadoDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.users.setClienteEstado(BigInt(id), dto.estado, user.userId);
  }
}
