import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Put,
  Query,
} from '@nestjs/common';
import { SalasService } from './salas.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import {
  ApiOperation,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { SalaResponseDto } from './dto/sala.response.dto';

@ApiTags('Salas')
@Controller('salas')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una sala nueva' })
  @ApiCreatedResponse({ type: SalaResponseDto, description: 'Sala creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiConflictResponse({ description: 'Ya existe una sala con ese nombre' })
  create(@Body() createSalaDto: CreateSalaDto): Promise<SalaResponseDto> {
    return this.salasService.create(createSalaDto);
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

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una sala existente' })
  @ApiOkResponse({
    type: SalaResponseDto,
    description: 'Sala actualizada. Si tiene funciones activas, la respuesta incluye un campo "warning".',
  })
  @ApiBadRequestResponse({ description: 'ID inválido o datos inválidos' })
  @ApiNotFoundResponse({ description: 'Sala no encontrada' })
  @ApiConflictResponse({ description: 'Ya existe una sala con ese nombre' })
  update(
    @Param('id') id: string,
    @Body() updateSalaDto: UpdateSalaDto,
  ): Promise<SalaResponseDto> {
    return this.salasService.update(id, updateSalaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una sala' })
  @ApiOkResponse({ description: 'Sala eliminada exitosamente' })
  @ApiNotFoundResponse({ description: 'Sala no encontrada' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  @ApiConflictResponse({ description: 'No se puede eliminar porque tiene funciones asociadas' })
  remove(@Param('id') id: string): Promise<{ id: number }> {
    return this.salasService.remove(id);
  }
}
