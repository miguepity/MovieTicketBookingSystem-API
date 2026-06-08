import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { QueryUsuariosDto } from './dto/query-usuarios.dto.js';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('Administracion de Usuarios')
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener una lista de usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente.' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida.' })
  @ApiResponse({ status: 404, description: 'No se encontraron usuarios.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  findAll(@Query() query: QueryUsuariosDto) {
    return this.usersService.findAll(query);
  }
}
