import { Controller, Get, Patch, Param, ParseIntPipe, Req, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiParam, ApiOperation } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Usuarios')
@Controller('users')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('token')
    @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
    @ApiResponse({ status: 200, description: 'Perfil del usuario autenticado obtenido exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async getMyProfile(@Req() req: any) {
        const userId = req.user?.id;
        return await this.usuariosService.getMyProfile(userId);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('token')
    @ApiOperation({ summary: 'Actualizar perfil del usuario (nombre, email, teléfono)' })
    @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
    async updateProfile(@Param('id', ParseIntPipe) id: number, @Body() updateProfileDto: UpdateProfileDto) {
      return await this.usuariosService.updateProfile(id, updateProfileDto);
    }

    @Patch(':id/notificaciones')
    @ApiBearerAuth('token')
    @ApiParam({ name: 'id', description: 'ID del usuario a desactivar/activar notificaciones'})
    @ApiResponse({ status: 200, description: 'Notificaciones del usuario desactivadas/activadas exitosamente'})
    @ApiResponse({ status: 401, description: 'No autorizado'})
    @ApiResponse({ status: 404, description: 'Usuario no encontrado'})
    @ApiResponse({ status: 409, description: 'No se puede desactivar/activar las notificaciones'})
    notificationStatus(@Param('id', ParseIntPipe) id: number) {
        return this.usuariosService.notificationStatus(id);
    }

    @Put(':id/password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Contraseña actualizada exitosamente'})
    @ApiResponse({ status: 401, description: 'No autorizado'})
    @ApiResponse({ status: 404, description: 'Usuario no encontrado'})
    @ApiResponse({ status: 409, description: 'Contraseña ya en uso'})
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos'})
  async cambiarPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePasswordDto: UpdatePasswordDto
  ) {
    return await this.usuariosService.cambiarPassword(id, updatePasswordDto);
  }

}

