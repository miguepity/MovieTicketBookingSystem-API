import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ListClientesQueryDto } from './dto/list-clientes-query.dto';
import { UpdateClienteEstadoDto } from './dto/update-cliente-estado.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('Admin Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/clientes')
export class AdminClientesController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes paginado con filtros opcionales' })
  list(@Query() q: ListClientesQueryDto) {
    return this.users.findClientesPaginated(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de cliente con últimas 10 reservas' })
  one(@Param('id') id: string) {
    return this.users.findClienteById(BigInt(id));
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de cliente (activo/bloqueado)' })
  setEstado(
    @Param('id') id: string,
    @Body() dto: UpdateClienteEstadoDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.users.setClienteEstado(BigInt(id), dto.estado, user.userId);
  }
}
