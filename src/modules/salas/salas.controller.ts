import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SalasService } from './salas.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiTags,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { SalaResponseDto } from './dto/sala.response.dto';
import { DeleteResponseDto } from '../../common/dto/delete-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateAsientosBatchDto } from './dto/update-asientos-batch.dto';
import { SalaAsientoResponseDto } from './dto/sala-asiento.response.dto';
import { UpdateAsientosBatchResponseDto } from './dto/update-asientos-batch.response.dto';

@ApiTags('Salas')
@Controller('salas')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una sala nueva' })
  @ApiCreatedResponse({
    type: SalaResponseDto,
    description: 'Sala creada exitosamente',
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiConflictResponse({ description: 'Ya existe una sala con ese nombre' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(
    @Body() createSalaDto: CreateSalaDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SalaResponseDto> {
    return this.salasService.create(createSalaDto, BigInt(user.userId));
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las salas' })
  @ApiQuery({
    name: 'id_cine',
    required: false,
    description: 'Filtrar por cine',
    example: '1',
  })
  @ApiOkResponse({ type: [SalaResponseDto], description: 'Listado de salas' })
  @ApiBadRequestResponse({ description: 'ID de cine inválido' })
  findAll(@Query('id_cine') id_cine?: string): Promise<SalaResponseDto[]> {
    return this.salasService.findAll(id_cine);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sala por ID' })
  @ApiOkResponse({ type: SalaResponseDto, description: 'Sala encontrada' })
  @ApiNotFoundResponse({ description: 'Sala no encontrada' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  findOne(@Param('id') id: string): Promise<SalaResponseDto> {
    return this.salasService.findOne(id);
  }

  @Get(':id/asientos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar asientos físicos de una sala con su tipo asignado',
  })
  @ApiParam({ name: 'id', description: 'ID de la sala', example: '1' })
  @ApiOkResponse({ type: [SalaAsientoResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente' })
  @ApiNotFoundResponse({ description: 'Sala no encontrada' })
  findAsientos(@Param('id') id: string): Promise<SalaAsientoResponseDto[]> {
    return this.salasService.findAsientos(id);
  }

  @Patch(':id/asientos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar tipos de asiento en batch para una sala',
    description:
      'Recibe una lista de pares { id_asiento, id_tipo_asiento }. Atómico — si una asignación es inválida, ninguna se aplica.',
  })
  @ApiParam({ name: 'id', description: 'ID de la sala', example: '1' })
  @ApiOkResponse({ type: UpdateAsientosBatchResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente' })
  @ApiNotFoundResponse({ description: 'Sala no encontrada' })
  @ApiBadRequestResponse({
    description: 'Asiento no pertenece a la sala o tipo inexistente',
  })
  updateAsientos(
    @Param('id') id: string,
    @Body() dto: UpdateAsientosBatchDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<UpdateAsientosBatchResponseDto> {
    return this.salasService.updateAsientos(id, dto, BigInt(user.userId));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una sala existente' })
  @ApiOkResponse({
    type: SalaResponseDto,
    description:
      'Sala actualizada. Si tiene funciones activas, la respuesta incluye un campo "warning".',
  })
  @ApiBadRequestResponse({ description: 'ID inválido o datos inválidos' })
  @ApiNotFoundResponse({ description: 'Sala no encontrada' })
  @ApiConflictResponse({ description: 'Ya existe una sala con ese nombre' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  update(
    @Param('id') id: string,
    @Body() updateSalaDto: UpdateSalaDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SalaResponseDto> {
    return this.salasService.update(id, updateSalaDto, BigInt(user.userId));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una sala' })
  @ApiOkResponse({ type: DeleteResponseDto, description: 'Sala eliminada exitosamente' })
  @ApiNotFoundResponse({ description: 'Sala no encontrada' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  @ApiConflictResponse({
    description: 'No se puede eliminar porque tiene funciones asociadas',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ id: string }> {
    return this.salasService.remove(id, BigInt(user.userId));
  }
}
