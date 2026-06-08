import { Controller, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';;

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

}

