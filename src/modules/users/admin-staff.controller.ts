import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ListStaffQueryDto } from './dto/list-staff-query.dto';
import { CrearStaffDto } from './dto/crear-staff.dto';
import { ActualizarStaffDto } from './dto/actualizar-staff.dto';
import { UpdateClienteEstadoDto } from './dto/update-cliente-estado.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('Admin Staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/staff')
export class AdminStaffController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar staff paginado con filtros opcionales' })
  list(@Query() q: ListStaffQueryDto) {
    return this.users.findStaffPaginated(q);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo usuario admin (staff)' })
  create(
    @Body() dto: CrearStaffDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.users.crearStaff(dto, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar nombre/email de staff' })
  update(
    @Param('id') id: string,
    @Body() dto: ActualizarStaffDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.users.actualizarStaff(BigInt(id), dto, user.userId);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de staff (activo/bloqueado)' })
  setEstado(
    @Param('id') id: string,
    @Body() dto: UpdateClienteEstadoDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.users.setStaffEstado(BigInt(id), dto.estado, user.userId);
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Resetear password de staff (genera temporal)' })
  resetPassword(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.users.resetStaffPassword(BigInt(id), user.userId);
  }
}
