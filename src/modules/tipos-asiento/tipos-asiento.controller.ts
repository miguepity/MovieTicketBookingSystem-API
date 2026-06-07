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
  Put,
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
import { TiposAsientoService } from './tipos-asiento.service';
import { CreateTipoAsientoDto } from './dto/create-tipo-asiento.dto';
import { UpdateTipoAsientoDto } from './dto/update-tipo-asiento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Tipos de asiento')
@Controller('tipos-asiento')
export class TiposAsientoController {
  constructor(private readonly tiposAsientoService: TiposAsientoService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar tipos de asiento con búsqueda parcial por nombre',
  })
  @ApiQuery({
    name: 'nombre',
    required: false,
    description: 'Coincidencia parcial sobre el nombre (case-insensitive)',
  })
  @ApiOkResponse({ description: 'Listado de tipos de asiento' })
  findAll(@Query('nombre') nombre?: string) {
    return this.tiposAsientoService.findAll(nombre);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de asiento por ID' })
  @ApiOkResponse({ description: 'Tipo de asiento encontrado' })
  @ApiNotFoundResponse({ description: 'Tipo de asiento no encontrado' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  findOne(@Param('id') id: string) {
    return this.tiposAsientoService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo tipo de asiento' })
  @ApiCreatedResponse({ description: 'Tipo de asiento creado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiConflictResponse({ description: 'El nombre ya está en uso' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(@Body() dto: CreateTipoAsientoDto) {
    return this.tiposAsientoService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reemplazar un tipo de asiento' })
  @ApiOkResponse({ description: 'Tipo de asiento actualizado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Tipo de asiento no encontrado' })
  @ApiConflictResponse({ description: 'El nombre ya está en uso' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  replace(@Param('id') id: string, @Body() dto: CreateTipoAsientoDto) {
    return this.tiposAsientoService.update(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar parcialmente un tipo de asiento' })
  @ApiOkResponse({ description: 'Tipo de asiento actualizado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Tipo de asiento no encontrado' })
  @ApiConflictResponse({ description: 'El nombre ya está en uso' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  update(@Param('id') id: string, @Body() dto: UpdateTipoAsientoDto) {
    return this.tiposAsientoService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un tipo de asiento' })
  @ApiOkResponse({ description: 'Tipo de asiento eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Tipo de asiento no encontrado' })
  @ApiConflictResponse({
    description:
      'No se puede eliminar porque tiene asientos o precios asociados',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  remove(@Param('id') id: string) {
    return this.tiposAsientoService.remove(id);
  }
}
