import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
} from '@nestjs/common';
import { CuponesService } from './cupones.service';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Cupones')
@Controller('cupones')
export class CuponesController {
  constructor(private readonly cuponesService: CuponesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los cupones' })
  @ApiOkResponse({ description: 'Listado de cupones' })
  findAll() {
    return this.cuponesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cupón por ID' })
  @ApiParam({ name: 'id', description: 'ID del cupón', example: '1' })
  @ApiOkResponse({ description: 'Cupón encontrado' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  @ApiNotFoundResponse({ description: 'Cupón no existe' })
  findOne(@Param('id') id: string) {
    return this.cuponesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear un cupón nuevo' })
  @ApiCreatedResponse({ description: 'Cupón creado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiConflictResponse({ description: 'Ya existe un cupón con ese código' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(@Body() dto: CreateCuponDto, @CurrentUser() user: CurrentUserPayload) {
    return this.cuponesService.create(dto, BigInt(user.userId));
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un cupón existente' })
  @ApiParam({ name: 'id', description: 'ID del cupón', example: '1' })
  @ApiOkResponse({ description: 'Cupón actualizado exitosamente' })
  @ApiBadRequestResponse({ description: 'ID inválido o datos inválidos' })
  @ApiNotFoundResponse({ description: 'Cupón no existe' })
  @ApiConflictResponse({ description: 'Ya existe un cupón con ese código' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCuponDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.cuponesService.update(id, dto, BigInt(user.userId));
  }

  @Post('validar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar un cupón por código' })
  @ApiOkResponse({ description: 'Cupón válido' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Cupón no existe' })
  @ApiConflictResponse({
    description:
      'El cupón no está activo, expiró o ya alcanzó su límite de uso',
  })
  validar(@Body() body: { codigo: string }) {
    return this.cuponesService.validar(body.codigo);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Alternar el estado activo/inactivo de un cupón' })
  @ApiParam({ name: 'id', description: 'ID del cupón', example: '1' })
  @ApiOkResponse({ description: 'Estado del cupón actualizado' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  @ApiNotFoundResponse({ description: 'Cupón no existe' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  toggleStatus(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.cuponesService.toggleStatus(id, BigInt(user.userId));
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un cupón' })
  @ApiParam({ name: 'id', description: 'ID del cupón', example: '1' })
  @ApiOkResponse({ description: 'Cupón eliminado exitosamente' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  @ApiNotFoundResponse({ description: 'Cupón no existe' })
  @ApiConflictResponse({
    description: 'No se puede eliminar el cupón porque ya fue usado en pagos',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.cuponesService.remove(id, BigInt(user.userId));
  }
}
