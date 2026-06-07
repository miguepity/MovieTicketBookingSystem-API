import { Controller, Get, Patch, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
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
import { UserListResponse } from './entities/user-list.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

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
  @ApiResponse({ status: 401, description: 'Contraseña actual incorrecta o no autenticado.' })
  @ApiResponse({ status: 403, description: 'No puedes modificar la contraseña de otro usuario.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  updatePassword(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.updatePassword(id, user.userId, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar estado de usuario',
    description: 'Cambia el estado de un usuario (activo, inactivo, suspendido) y registra la acción en la bitácora.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado.',
    schema: { example: { message: 'Estado del usuario actualizado a "inactivo"' } },
  })
  @ApiResponse({ status: 400, description: 'Estado inválido o igual al actual.' })
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
    description: 'Activa o desactiva las notificaciones del usuario. Solo el propio usuario puede modificar su preferencia.',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferencia actualizada.',
    schema: { example: { notificaciones_activas: true } },
  })
  @ApiResponse({ status: 403, description: 'No puedes modificar las notificaciones de otro usuario.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  toggleNotificaciones(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.usersService.toggleNotificaciones(id, user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Devuelve todos los usuarios con filtros opcionales por nombre, email y estado, más paginación.',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente.', type: UserListResponse })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }
}
