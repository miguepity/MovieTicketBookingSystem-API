import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { UserListResponseDto } from './dto/user-list-response.dto';
import { ToggleNotificacionesResponseDto } from './dto/toggle-notificaciones-response.dto';
import { UpdatePerfilResponseDto } from './dto/update-perfil-response.dto';
import { MessageResponseDto } from '../../common/dto/message-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Users')
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar contraseña',
    description:
      'Actualiza la contraseña del usuario. Solo el propio usuario puede modificar su contraseña.',
  })
  @ApiOkResponse({
    description: 'Contraseña actualizada exitosamente.',
    type: MessageResponseDto,
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
  @ApiOkResponse({
    description: 'Estado actualizado.',
    type: MessageResponseDto,
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
  @ApiOkResponse({
    description: 'Preferencia actualizada.',
    type: ToggleNotificacionesResponseDto,
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
    summary: '[DEPRECATED] Actualizar perfil — use PATCH /me/perfil',
    description:
      'Actualiza el perfil del usuario autenticado. **Deprecated**: use `PATCH /me/perfil` instead.',
    deprecated: true,
  })
  @ApiOkResponse({
    description: 'Perfil actualizado exitosamente.',
    type: UpdatePerfilResponseDto,
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
  @ApiOkResponse({
    description: 'Lista de usuarios obtenida exitosamente.',
    type: UserListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }
}
