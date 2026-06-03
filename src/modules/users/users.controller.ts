import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserListResponse } from './entities/user-list.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Devuelve todos los usuarios con filtros opcionales por nombre, email y estado, más paginación.',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente.', type: UserListResponse })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }
}
