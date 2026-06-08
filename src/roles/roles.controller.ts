import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '../auth/auth.guard';
import { IsAdminGuard } from './admin.guard';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UseGuards(AuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo rol (Solo Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Rol creado exitosamente',
    schema: {
      example: {
        id: '3',
        nombre: 'moderator',
      },
    },
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los roles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles',
    schema: {
      example: [
        { id: '1', nombre: 'admin' },
        { id: '2', nombre: 'client' },
      ],
    },
  })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({
    status: 200,
    description: 'Detalle del rol',
    schema: {
      example: { id: '1', nombre: 'admin' },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un rol por ID (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID del rol a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado exitosamente',
    schema: {
      example: { id: '1', nombre: 'superadmin' },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un rol por ID (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID del rol a eliminar' })
  @ApiResponse({
    status: 200,
    description: 'Rol eliminado exitosamente',
    schema: {
      example: { message: 'Rol con ID 1 eliminado correctamente' },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}
