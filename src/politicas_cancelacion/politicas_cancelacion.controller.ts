import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PoliticasCancelacionService } from './politicas_cancelacion.service';
import { CreatePoliticaCancelacionDto } from './dto/create-politica-cancelacion.dto';
import { UpdatePoliticaCancelacionDto } from './dto/update-politica-cancelacion.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Políticas de Cancelación')
@Controller('politicas-cancelacion')
export class PoliticasCancelacionController {
  constructor(
    private readonly politicasCancelacionService: PoliticasCancelacionService,
  ) {}

  @Post()
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva política de cancelación' })
  @ApiResponse({
    status: 201,
    description: 'Política de cancelación creada con éxito.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  create(@Body() createDto: CreatePoliticaCancelacionDto) {
    return this.politicasCancelacionService.create(createDto);
  }

  @Get()
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CLIENTE', 'RECEPCIONISTA')
  @ApiOperation({ summary: 'Listar todas las políticas de cancelación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de políticas de cancelación retornada con éxito.',
  })
  findAll() {
    return this.politicasCancelacionService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CLIENTE', 'RECEPCIONISTA')
  @ApiOperation({ summary: 'Obtener una política de cancelación por su ID' })
  @ApiResponse({
    status: 200,
    description: 'Política de cancelación encontrada con éxito.',
  })
  @ApiResponse({
    status: 404,
    description: 'Política de cancelación no encontrada.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico de la política' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.politicasCancelacionService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar una política de cancelación por ID' })
  @ApiResponse({
    status: 200,
    description: 'Política de cancelación modificada exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 404,
    description: 'Política de cancelación no encontrada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la política a modificar',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePoliticaCancelacionDto,
  ) {
    return this.politicasCancelacionService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una política de cancelación por ID' })
  @ApiResponse({
    status: 200,
    description: 'Política de cancelación eliminada con éxito.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 404,
    description: 'Política de cancelación no encontrada.',
  })
  @ApiParam({ name: 'id', description: 'ID de la política a eliminar' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.politicasCancelacionService.remove(id);
  }
}
