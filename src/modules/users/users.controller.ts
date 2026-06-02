import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserListResponse } from './entities/user-list.entity';

@ApiTags('Users')
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Devuelve todos los usuarios con filtros opcionales por nombre, email y estado, más paginación.',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente.', type: UserListResponse })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }
}
