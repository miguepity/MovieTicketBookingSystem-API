import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { RolResponseDto } from './dto/rol-response.dto';
import { DeleteResponseDto } from '../../common/dto/delete-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles as RolesDecorator } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar roles con búsqueda parcial por nombre',
  })
  @ApiQuery({
    name: 'nombre',
    required: false,
    description: 'Coincidencia parcial sobre el nombre (case-insensitive)',
  })
  @ApiOkResponse({ type: RolResponseDto, isArray: true, description: 'Listado de roles obtenido exitosamente' })
  findAll(@Query('nombre') nombre?: string) {
    return this.rolesService.findAll(nombre);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiOkResponse({ type: RolResponseDto, description: 'Rol encontrado' })
  @ApiNotFoundResponse({ description: 'Rol no encontrado' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiCreatedResponse({ type: RolResponseDto, description: 'Rol creado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiConflictResponse({ description: 'El nombre ya está en uso' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(
    @Body() createRolDto: CreateRolDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.rolesService.create(createRolDto, BigInt(user.userId));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un rol existente' })
  @ApiOkResponse({ type: RolResponseDto, description: 'Rol actualizado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Rol no encontrado' })
  @ApiConflictResponse({ description: 'El nombre ya está en uso' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  update(
    @Param('id') id: string,
    @Body() updateRolDto: UpdateRolDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.rolesService.update(id, updateRolDto, BigInt(user.userId));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un rol' })
  @ApiOkResponse({ type: DeleteResponseDto, description: 'Rol eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Rol no encontrado' })
  @ApiConflictResponse({
    description: 'No se puede eliminar porque tiene usuarios asociados',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.rolesService.remove(id, BigInt(user.userId));
  }
}
