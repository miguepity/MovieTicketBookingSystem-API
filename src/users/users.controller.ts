import {
  Controller,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Usuarios')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar información de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    schema: {
      example: {
        id: '1',
        nombre: 'Juan Perez',
        email: 'juan.nuevo@example.com',
        telefono: '+50211223344',
        id_rol: '2',
        estado: 'active',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: El email ya está en uso',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const usuario = await this.usersService.update(id, updateUserDto);

    return { ...usuario, id: usuario.id.toString() };
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    schema: {
      example: [
        {
          id: '1',
          nombre: 'Juan Perez',
          email: 'juan.nuevo@example.com',
          telefono: '+50211223344',
          id_rol: '2',
          estado: 'active',
        },
      ],
    },
  })
  async getUsers(@Query() searchUserDto: SearchUserDto) {
    return await this.usersService.findAll(searchUserDto);
  }
}
