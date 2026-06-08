import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { QueryUsuariosDto } from './dto/query-usuarios.dto.js';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';
import { RolesGuard } from '../../guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';

@ApiTags('Usuarios')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar clientes por nombre o email' })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda parcial por nombre o email', example: 'juan' })
  @ApiResponse({ status: 200, description: 'Lista de clientes retornada exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol ADMIN.' })
  buscarClientes(@Query() query: QueryUsuariosDto) {
    return this.usersService.buscarClientes(query);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar el estado de un usuario con registro en bitácora' })
  @ApiParam({ name: 'id', description: 'ID del usuario a modificar', example: '1' })
  @ApiResponse({ status: 200, description: 'Estado actualizado y bitácora registrada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Estado inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol ADMIN.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  cambiarEstado(
    @Param('id') id: string,
    @Body() dto: CambiarEstadoDto,
    @CurrentUser('id') auditorId: number,
  ) {
    return this.usersService.cambiarEstado(id, dto, auditorId);
  }
}
