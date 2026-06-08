import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Put,
  Patch,
} from '@nestjs/common';
import { FuncionesService } from './funciones.service';
import { CreateFuncionDto } from './dto/create-funcion.dto';
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateFuncionDto } from './dto/update-funcion.dto';

@ApiTags('Funciones')
@Controller('funciones')
export class FuncionesController {
  constructor(private readonly funcionesService: FuncionesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear una función nueva' })
  @ApiCreatedResponse({ description: 'Función creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiConflictResponse({
    description: 'Ya existe una función programada para esa sala y horario',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(@Body() dto: CreateFuncionDto) {
    return this.funcionesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las funciones' })
  @ApiOkResponse({ description: 'Listado de funciones' })
  findAll() {
    return this.funcionesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una función por ID' })
  @ApiParam({ name: 'id', description: 'ID de la función', example: '1' })
  @ApiOkResponse({ description: 'Función encontrada' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  @ApiNotFoundResponse({ description: 'La función no existe' })
  findOne(@Param('id') id: string) {
    return this.funcionesService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una función existente' })
  @ApiParam({ name: 'id', description: 'ID de la función', example: '1' })
  @ApiOkResponse({ description: 'Función actualizada exitosamente' })
  @ApiBadRequestResponse({ description: 'ID inválido o datos inválidos' })
  @ApiNotFoundResponse({ description: 'Función no existe' })
  @ApiConflictResponse({
    description:
      'No se puede editar porque hay reservas o ya existe otra función en esa sala y horario',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  update(@Param('id') id: string, @Body() dto: UpdateFuncionDto) {
    return this.funcionesService.update(id, dto);
  }

  @Patch(':id/cancelar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar una función' })
  @ApiParam({ name: 'id', description: 'ID de la función', example: '1' })
  @ApiOkResponse({ description: 'Función cancelada exitosamente' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  @ApiNotFoundResponse({ description: 'Función no existe' })
  @ApiConflictResponse({
    description: 'La función ya está cancelada o ya inició',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  cancelar(@Param('id') id: string) {
    return this.funcionesService.cancelar(id);
  }
}
