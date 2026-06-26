import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
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
import { IdiomasService } from './idiomas.service';
import { CreateIdiomaDto } from './dto/create-idioma.dto';
import { UpdateIdiomaDto } from './dto/update-idioma.dto';
import { IdiomaResponseDto } from './dto/idioma-response.dto';
import { DeleteResponseDto } from '../../common/dto/delete-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

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
  @ApiOkResponse({ type: IdiomaResponseDto, isArray: true, description: 'Listado de idiomas obtenido exitosamente' })
  findAll(@Query('nombre') nombre?: string) {
    return this.idiomasService.findAll(nombre);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un idioma por ID' })
  @ApiOkResponse({ type: IdiomaResponseDto, description: 'Idioma encontrado' })
  @ApiNotFoundResponse({ description: 'Idioma no encontrado' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  findOne(@Param('id') id: string) {
    return this.idiomasService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo idioma' })
  @ApiCreatedResponse({ type: IdiomaResponseDto, description: 'Idioma creado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiConflictResponse({ description: 'El nombre ya está en uso' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(
    @Body() createIdiomaDto: CreateIdiomaDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.idiomasService.create(createIdiomaDto, BigInt(user.userId));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un idioma existente' })
  @ApiOkResponse({ type: IdiomaResponseDto, description: 'Idioma actualizado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Idioma no encontrado' })
  @ApiConflictResponse({ description: 'El nombre ya está en uso' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  update(
    @Param('id') id: string,
    @Body() updateIdiomaDto: UpdateIdiomaDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.idiomasService.update(id, updateIdiomaDto, BigInt(user.userId));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un idioma' })
  @ApiOkResponse({ type: DeleteResponseDto, description: 'Idioma eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Idioma no encontrado' })
  @ApiConflictResponse({
    description: 'No se puede eliminar porque tiene películas asociadas',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.idiomasService.remove(id, BigInt(user.userId));
  }
}
