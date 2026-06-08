import { Controller, Patch, Param, ParseIntPipe, Req, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { UpdateEmailDto } from './dto/update-email.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Usuarios')
@Controller('users')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

    @Patch(':id/notificaciones')
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'ID del usuario a desactivar/activar notificaciones'})
    @ApiResponse({ status: 200, description: 'Notificaciones del usuario desactivadas/activadas exitosamente'})
    @ApiResponse({ status: 401, description: 'No autorizado'})
    @ApiResponse({ status: 404, description: 'Usuario no encontrado'})
    @ApiResponse({ status: 409, description: 'No se puede desactivar/activar las notificaciones'})
    notificationStatus(@Param('id', ParseIntPipe) id: number) {
        return this.usuariosService.notificationStatus(id);
    }

    @Put(':id')
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Correo electrónico actualizado exitosamente'})
    @ApiResponse({ status: 401, description: 'No autorizado'})
    @ApiResponse({ status: 404, description: 'Usuario no encontrado'})
    @ApiResponse({ status: 409, description: 'Correo electrónico ya en uso'})
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos'})
    @UseGuards(JwtAuthGuard)
    async cambiarEmail(@Body() updateEmailDto: UpdateEmailDto, @Req() req: any) {
        const userId = req.user?.id;
        return await this.usuariosService.cambiarEmail(userId, updateEmailDto);
    }

}

