import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './create-role.dto';
import { UpdateRoleDto } from './update-role.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Roles de Usuario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN') 
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo rol ' })
  @ApiResponse({ status: 201, description: 'Rol creado con éxito.' })
  @ApiResponse({ status: 409, description: 'El nombre del rol ya existe.' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los roles registrados' })
  @ApiResponse({ status: 200, description: 'Lista de roles retornada.' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por su ID ' })
  @ApiParam({ name: 'id', description: 'ID numérico del rol' })
  @ApiResponse({ status: 200, description: 'Rol encontrado.' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol por ID ' })
  @ApiParam({ name: 'id', description: 'ID numérico del rol a modificar' })
  @ApiResponse({ status: 200, description: 'Rol actualizado con éxito.' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un rol por ID ' })
  @ApiParam({ name: 'id', description: 'ID numérico del rol a eliminar' })
  @ApiResponse({ status: 200, description: 'Rol eliminado con éxito.' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar (Tiene usuarios asignados).' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}