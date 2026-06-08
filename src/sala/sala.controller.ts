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
import { SalaService } from './sala.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('salas')
@Controller('salas')
export class SalaController {
  constructor(private readonly salaService: SalaService) {}

  @Post()
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva sala (genera asientos automáticamente)' })
  @ApiResponse({
    status: 201,
    description: 'La sala ha sido creada exitosamente con sus asientos.',
  })
  @ApiResponse({ status: 404, description: 'Cine no encontrado.' })
  create(@Body() createSalaDto: CreateSalaDto) {
    return this.salaService.create(createSalaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las salas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de salas retornada con éxito.',
  })
  findAll() {
    return this.salaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sala por su ID' })
  @ApiResponse({ status: 200, description: 'Sala encontrada con éxito.' })
  @ApiResponse({ status: 404, description: 'Sala no encontrada.' })
  @ApiParam({ name: 'id', description: 'ID numérico de la sala' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salaService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Modificar una sala existente' })
  @ApiResponse({
    status: 200,
    description: 'La sala ha sido modificada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Sala o Cine no encontrado.' })
  @ApiParam({ name: 'id', description: 'ID numérico de la sala a modificar' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalaDto: UpdateSalaDto,
  ) {
    return this.salaService.update(id, updateSalaDto);
  }

  @Delete(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una sala por ID' })
  @ApiResponse({ status: 200, description: 'Sala eliminada con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Sala no encontrada.' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar (tiene funciones asociadas).',
  })
  @ApiParam({ name: 'id', description: 'ID de la sala a eliminar' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salaService.remove(id);
  }
}
