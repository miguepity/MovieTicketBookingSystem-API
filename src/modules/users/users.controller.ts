import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
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
import { QueryUsersDto } from './dto/query-users.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { UserListResponse } from './entities/user-list.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Users')
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put(':id/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar contraseña',
    description:
      'Actualiza la contraseña del usuario. Solo el propio usuario puede modificar su contraseña.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente.',
    schema: { example: { message: 'Contraseña actualizada exitosamente' } },
  })
  @ApiResponse({
    status: 401,
    description: 'Contraseña actual incorrecta o no autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'No puedes modificar la contraseña de otro usuario.',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  updatePassword(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.updatePassword(id, user.userId, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar estado de usuario',
    description:
      'Cambia el estado de un usuario (activo, inactivo, suspendido) y registra la acción en la bitácora. Solo el rol admin puede realizar esta operación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado.',
    schema: {
      example: { message: 'Estado del usuario actualizado a "inactivo"' },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Estado inválido o igual al actual.',
  })
  @ApiResponse({ status: 403, description: 'Rol no autorizado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.usersService.updateStatus(id, user.userId, dto);
  }

  @Patch(':id/notificaciones')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Toggle notificaciones',
    description:
      'Activa o desactiva las notificaciones del usuario. Solo el propio usuario puede modificar su preferencia.',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferencia actualizada.',
    schema: { example: { notificaciones_activas: true } },
  })
  @ApiResponse({
    status: 403,
    description: 'No puedes modificar las notificaciones de otro usuario.',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  toggleNotificaciones(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.usersService.toggleNotificaciones(id, user.userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar perfil',
    description:
      'Actualiza el perfil del usuario autenticado (nombre, teléfono, notificaciones_activas).',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente.',
    schema: {
      example: {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '+502 1234 5678',
        notificaciones_activas: true,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  updatePerfil(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdatePerfilDto,
  ) {
    return this.usersService.updatePerfil(BigInt(user.userId), dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar usuarios',
    description:
      'Devuelve todos los usuarios con filtros opcionales por nombre, email y estado, más paginación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente.',
    type: UserListResponse,
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }
}
