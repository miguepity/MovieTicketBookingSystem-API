import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { QueryUsuariosDto } from './dto/query-usuarios.dto.js';

@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: QueryUsuariosDto) {
    return this.usersService.findAll(query);
  }
}
