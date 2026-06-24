import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PreciosCineService } from './precios-cine.service';
import { CreatePrecioCineDto } from './dto/create-precio-cine.dto';
import { UpdatePrecioCineDto } from './dto/update-precio-cine.dto';
import { ListPreciosCineQueryDto } from './dto/list-precios-cine-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('Precios por cine')
@Controller('precios-cine')
export class PreciosCineController {
  constructor(private readonly preciosCineService: PreciosCineService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar precios por cine, con filtros opcionales',
  })
  @ApiOkResponse({ description: 'Listado de precios' })
  findAll(@Query() query: ListPreciosCineQueryDto) {
    return this.preciosCineService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un precio por ID' })
  @ApiOkResponse({ description: 'Precio encontrado' })
  @ApiNotFoundResponse({ description: 'Precio no encontrado' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  findOne(@Param('id') id: string) {
    return this.preciosCineService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear precio para un (cine, tipo de asiento)' })
  @ApiCreatedResponse({ description: 'Precio creado exitosamente' })
  @ApiBadRequestResponse({
    description: 'Cine o tipo de asiento inexistente, o payload inválido',
  })
  @ApiConflictResponse({
    description: 'Ya existe un precio para ese cine y tipo de asiento',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(
    @Body() dto: CreatePrecioCineDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.preciosCineService.create(dto, BigInt(user.userId));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar el precio (solo el monto)' })
  @ApiOkResponse({ description: 'Precio actualizado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Precio no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePrecioCineDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.preciosCineService.update(id, dto, BigInt(user.userId));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un precio' })
  @ApiOkResponse({ description: 'Precio eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Precio no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.preciosCineService.remove(id, BigInt(user.userId));
  }
}
