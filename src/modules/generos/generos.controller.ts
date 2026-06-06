import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { GenerosService } from './generos.service';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Generos')
@Controller('generos')
export class GenerosController {
  constructor(private readonly generosService: GenerosService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar géneros con búsqueda parcial por nombre',
  })
  @ApiQuery({
    name: 'nombre',
    required: false,
    description: 'Coincidencia parcial sobre el nombre (case-insensitive)',
  })
  @ApiOkResponse({ description: 'Listado de géneros obtenido exitosamente' })
  findAll(@Query('nombre') nombre?: string) {
    return this.generosService.findAll(nombre);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un género por ID' })
  @ApiOkResponse({ description: 'Género encontrado' })
  @ApiNotFoundResponse({ description: 'Género no encontrado' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  findOne(@Param('id') id: string) {
    return this.generosService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo género' })
  @ApiCreatedResponse({ description: 'Género creado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiConflictResponse({ description: 'El nombre ya está en uso' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(@Body() createGeneroDto: CreateGeneroDto) {
    return this.generosService.create(createGeneroDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un género existente' })
  @ApiOkResponse({ description: 'Género actualizado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Género no encontrado' })
  @ApiConflictResponse({ description: 'El nombre ya está en uso' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  update(@Param('id') id: string, @Body() updateGeneroDto: UpdateGeneroDto) {
    return this.generosService.update(id, updateGeneroDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un género' })
  @ApiOkResponse({ description: 'Género eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Género no encontrado' })
  @ApiConflictResponse({
    description: 'No se puede eliminar porque tiene películas asociadas',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  remove(@Param('id') id: string) {
    return this.generosService.remove(id);
  }
}
