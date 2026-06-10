import {
  Controller,
  Put,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ToggleNotificacionesDto } from './dto/toggle-notificaciones.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

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
}
