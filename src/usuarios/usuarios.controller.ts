import { Controller, ValidationPipe, ParseIntPipe, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { Body, Put, Param, Patch, Post, Get, Query } from '@nestjs/common';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar el email de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async updateUserEmail(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateEmailDto: UpdateEmailDto,
  ) {
    return this.usuariosService.updateUserEmail(id, updateEmailDto.newEmail);
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
  ) {
    return this.usuariosService.updateStatus(id, updateStatusDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los clientes' })
  async findAllClientes() {
    return this.usuariosService.findAllClientes();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar clientes por nombre, correo o teléfono',
  })
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

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.deleteUser(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Eliminar todos los usuarios' })
  deleteAllUsers() {
    return this.usuariosService.deleteAllUsers();
  }
}
