import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class MePerfilController {
  constructor(private readonly users: UsersService) {}

  @Get('perfil')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario autenticado.',
    schema: {
      example: {
        id: '1',
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '+502 1234 5678',
        notificaciones_activas: true,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  get(@CurrentUser() user: CurrentUserPayload) {
    return this.users.findById(BigInt(user.userId));
  }

  @Patch('perfil')
  @ApiOperation({
    summary: 'Actualizar perfil del usuario autenticado',
    description:
      'Actualiza el perfil del usuario autenticado (nombre, teléfono, notificaciones_activas).',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente.',
    schema: {
      example: {
        id: '1',
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
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdatePerfilDto,
  ) {
    return this.users.updatePerfil(BigInt(user.userId), dto);
  }
}
