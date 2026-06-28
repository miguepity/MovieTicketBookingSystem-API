import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
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
import { PerfilResponseDto } from './dto/perfil-response.dto';
import { UpdatePerfilResponseDto } from './dto/update-perfil-response.dto';

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
    type: PerfilResponseDto,
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
    type: UpdatePerfilResponseDto,
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

  @Delete('cuenta')
  @ApiOperation({
    summary: 'Eliminar cuenta del usuario autenticado',
    description:
      'Soft-delete del usuario autenticado: la cuenta queda con estado="eliminado" y no podrá volver a iniciar sesión. Los datos históricos (reservas, pagos) se conservan.',
  })
  @ApiResponse({ status: 200, description: 'Cuenta eliminada exitosamente.' })
  @ApiResponse({ status: 400, description: 'La cuenta ya está eliminada.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  delete(@CurrentUser() user: CurrentUserPayload) {
    return this.users.softDeleteMe(user.userId);
  }
}
