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
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IdiomasService } from './idiomas.service';
import { CreateIdiomaDto } from './dto/create-idioma.dto';
import { UpdateIdiomaDto } from './dto/update-idioma.dto';

@ApiTags('Idiomas')
@Controller('idiomas')
export class IdiomasController {
  constructor(private readonly idiomasService: IdiomasService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar idiomas con búsqueda parcial por nombre',
  })
  @ApiQuery({
    name: 'nombre',
    required: false,
    description: 'Coincidencia parcial sobre el nombre (case-insensitive)',
  })
  @ApiOkResponse({ description: 'Listado de idiomas obtenido exitosamente' })
  findAll(@Query('nombre') nombre?: string) {
    return this.idiomasService.findAll(nombre);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un idioma por ID' })
  @ApiOkResponse({ description: 'Idioma encontrado' })
  @ApiNotFoundResponse({ description: 'Idioma no encontrado' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  findOne(@Param('id') id: string) {
    return this.idiomasService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo idioma' })
  @ApiCreatedResponse({ description: 'Idioma creado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiConflictResponse({ description: 'El nombre ya está en uso' })
  create(@Body() createIdiomaDto: CreateIdiomaDto) {
    return this.idiomasService.create(createIdiomaDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un idioma existente' })
  @ApiOkResponse({ description: 'Idioma actualizado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Idioma no encontrado' })
  @ApiConflictResponse({ description: 'El nombre ya está en uso' })
  update(@Param('id') id: string, @Body() updateIdiomaDto: UpdateIdiomaDto) {
    return this.idiomasService.update(id, updateIdiomaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un idioma' })
  @ApiOkResponse({ description: 'Idioma eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Idioma no encontrado' })
  @ApiConflictResponse({
    description: 'No se puede eliminar porque tiene películas asociadas',
  })
  remove(@Param('id') id: string) {
    return this.idiomasService.remove(id);
  }
}
