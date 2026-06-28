import { Body, Controller, Get, Param, Patch, Query, UseGuards, ParseIntPipe, Put, Delete, Post } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { QueryUsuariosDto } from './dto/query-usuarios.dto.js';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';
import { RolesGuard } from '../../guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';

@ApiTags('Usuarios')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'RECEPCIONISTA')
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
      @UseGuards(JwtAuthGuard)
      @ApiBearerAuth('token')
      @ApiOperation({ summary: 'Crear un nuevo usuario' })
      @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
      @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
      @ApiResponse({ status: 401, description: 'No autorizado' })
      @ApiResponse({ status: 404, description: 'Rol no encontrado' })
      @ApiResponse({ status: 409, description: 'Correo electrónico ya en uso' })
      @Roles('ADMIN', 'RECEPCIONISTA')
      async create(
          @Body() createUserDto: CreateUserDto,
          @CurrentUser('role') requesterRole: string,
      ) {
          return await this.usersService.create(createUserDto, requesterRole);
      }
  

  @Get()
  @ApiOperation({ summary: 'Buscar clientes por nombre o email' })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda parcial por nombre o email', example: 'juan' })
  @ApiResponse({ status: 200, description: 'Lista de clientes retornada exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol ADMIN o RECEPCIONISTA.' })
  buscarClientes(@Query() query: QueryUsuariosDto) {
    return this.usersService.buscarClientes(query);
  }

  @Get('all')
  @ApiOperation({ summary: 'Listar todos los usuarios con filtro opcional de rol' })
  @ApiQuery({ name: 'rolId', required: false, description: 'ID del rol para filtrar', example: '1' })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda por nombre o email', example: 'admin' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios retornada exitosamente.' })
  listarUsuarios(
    @Query('rolId', new ParseIntPipe({ optional: true })) rolId?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.listarUsuarios({ rolId, search });
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

  @Put(':id')
  @ApiOperation({ summary: 'Editar datos de un usuario (nombre, email, rol)' })
  @ApiBody({ schema: { type: 'object', properties: { nombre: { type: 'string' }, email: { type: 'string' }, id_rol: { type: 'number' } } } })
  editarUsuario(
    @Param('id') id: string,
    @Body() dto: { nombre?: string; email?: string; id_rol?: number },
    @CurrentUser('id') auditorId: number,
  ) {
    return this.usersService.editarUsuario(id, dto, auditorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  eliminarUsuario(@Param('id') id: string, @CurrentUser('id') auditorId: number) {
    return this.usersService.eliminarUsuario(id, auditorId);
  }
}
