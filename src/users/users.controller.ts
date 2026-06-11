import {
  Controller,
  Put,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Get,
  Query,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { SearchUserDto } from './dto/search-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ToggleNotificacionesDto } from './dto/toggle-notificaciones.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { IsAdminGuard } from '../roles/admin.guard';

@ApiTags('Usuarios')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar información de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    schema: {
      example: {
        id: '1',
        nombre: 'Juan Perez',
        email: 'juan.nuevo@example.com',
        telefono: '+50211223344',
        id_rol: '2',
        estado: 'active',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: El email ya está en uso',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const usuario = await this.usersService.update(id, updateUserDto);
    return {
      ...usuario,
      id: usuario.id.toString(),
      id_rol: usuario.id_rol.toString(),
    };
  }

  @Patch(':id/notificaciones')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Toggle de preferencia de notificaciones del usuario',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Preferencia de notificaciones actualizada exitosamente',
    schema: {
      example: {
        id: '1',
        notificaciones_activas: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async toggleNotificaciones(
    @Param('id', ParseIntPipe) id: number,
    @Body() toggleDto: ToggleNotificacionesDto,
  ) {
    const usuario = await this.usersService.toggleNotificaciones(
      id,
      toggleDto.notificaciones_activas,
    );

    return {
      id: usuario.id.toString(),
      notificaciones_activas: usuario.notificaciones_activas,
    };
    }    
  
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    schema: {
      example: [
        {
          id: '1',
          nombre: 'Juan Perez',
          email: 'juan.nuevo@example.com',
          telefono: '+50211223344',
          id_rol: '2',
          estado: 'active',
        },
      ],
    },
  })
  async getUsers(
    @Query() searchUserDto: SearchUserDto,
    @Request() req: Request,
  ) {
    if (BigInt(req['user'].role) !== BigInt(1))
      throw new ForbiddenException(
        'No tienes permiso para ver esta información',
      );

    return await this.usersService.findAll(searchUserDto);
    }
  
  @Put(':id/password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar la contraseña de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
    schema: {
      example: { message: 'Contraseña actualizada correctamente' },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'La contraseña actual es incorrecta',
  })
  async updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Request() req: any,
  ) {
    const user = req.user as { userId: string; email: string; role: string };
    if (user.userId !== String(id)) {
      throw new ForbiddenException(
        'No tienes permiso para cambiar esta contraseña',
      );
    }

    return await this.usersService.updatePassword(id, updatePasswordDto);
  }

  @Patch('/admin/users/:id/status')
  @UseGuards(AuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar estado de un usuario (Admin)' })
  @ApiParam({ name: 'id', description: 'ID del usuario a modificar' })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado y registrado en bitácora',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido: Solo administradores pueden realizar esta acción',
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req: any,
  ) {
    const adminId = Number(req.user.userId);
    return await this.usersService.updateStatus(id, updateStatusDto, adminId);
  }
}
