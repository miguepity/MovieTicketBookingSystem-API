import {
  Controller,
  ValidationPipe,
  ParseIntPipe,
  Delete,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { Body, Put, Param, Patch, Post, Get, Query } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ClientesFilterDto } from './dto/clientes-filter.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  private extractAuditorId(req: Request): number | null {
    try {
      const auth = req.headers['authorization'];
      if (!auth) return null;
      const token = auth.replace('Bearer ', '');
      const payload = this.jwtService.decode(token) as { sub?: string } | null;
      return payload?.sub ? Number(payload.sub) : null;
    } catch {
      return null;
    }
  }

  @Post('admin-create')
  @ApiOperation({ summary: 'Crear un usuario con rol específico (uso admin)' })
  async adminCreateUser(
    @Body(new ValidationPipe({ whitelist: true })) dto: AdminCreateUserDto,
  ) {
    return this.usuariosService.adminCreateUser(dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar el nombre, email y/o teléfono de un usuario',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateProfileDto: UpdateProfileDto,
  ) {
    return this.usuariosService.updateProfile(id, updateProfileDto);
  }

  @Put(':id/password')
  @ApiOperation({ summary: 'Actualizar la contraseña de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usuariosService.updatePassword(id, updatePasswordDto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Cambiar el estado (activo/inactivo) de un usuario',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
    @Req() req: Request,
  ) {
    return this.usuariosService.updateStatus(
      id,
      updateStatusDto,
      this.extractAuditorId(req),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes con filtros y paginación' })
  async findAllClientes(@Query() filtro: ClientesFilterDto) {
    return this.usuariosService.findAllClientes(filtro);
  }

  @Get('todos')
  @ApiOperation({
    summary: 'Listar todos los usuarios con sus roles (paginado)',
  })
  async findAllUsuarios(@Query() filtro: ClientesFilterDto) {
    return this.usuariosService.findAllUsuarios(filtro);
  }

  @Get('todos/simple')
  @ApiOperation({ summary: 'Listar todos los usuarios con sus roles (paginado)' })
  async findAllClientesSimple() {
    return this.usuariosService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar clientes por nombre, correo o teléfono' })
  @ApiQuery({ name: 'q', required: false, description: 'Texto a buscar' })
  searchClientes(@Query('q') q?: string) {
    return this.usuariosService.searchClientes(q);
  }

  @Patch(':id/notifications')
  @ApiOperation({
    summary: 'Activar o desactivar notificaciones de un usuario',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  toggleNotifications(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.toggleNotifications(id);
  }

  @Post(':id/trigger-cancelacion')
  @ApiOperation({ summary: 'Disparar cancelación manual para un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  triggerCancelacion(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.triggerCancelacionUsuario(id);
  }

  @Get('suscritos-nueva-pelicula')
  @ApiOperation({
    summary: 'Listar clientes suscritos a notificaciones de nuevas películas',
  })
  getClientesSuscritos() {
    return this.usuariosService.findClientesSuscritos();
  }

  @Patch(':id/rol')
  @ApiOperation({ summary: 'Actualizar el rol de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateUserRoleDto,
    @Req() req: Request,
  ) {
    return this.usuariosService.updateUserRole(
      id,
      dto,
      this.extractAuditorId(req),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener los datos de un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  deleteUser(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.usuariosService.deleteUser(id, this.extractAuditorId(req));
  }

  @Delete()
  @ApiOperation({ summary: 'Eliminar todos los usuarios' })
  deleteAllUsers() {
    return this.usuariosService.deleteAllUsers();
  }
}
