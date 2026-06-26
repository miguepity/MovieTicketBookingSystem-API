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
import { GenerosService } from './generos.service';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';
import { GeneroResponseDto } from './dto/genero-response.dto';
import { DeleteResponseDto } from '../../common/dto/delete-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

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
  @ApiOkResponse({ type: GeneroResponseDto, isArray: true, description: 'Listado de géneros obtenido exitosamente' })
  findAll(@Query('nombre') nombre?: string) {
    return this.generosService.findAll(nombre);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un género por ID' })
  @ApiOkResponse({ type: GeneroResponseDto, description: 'Género encontrado' })
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
  @ApiCreatedResponse({ type: GeneroResponseDto, description: 'Género creado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiConflictResponse({ description: 'El nombre ya está en uso' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(
    @Body() createGeneroDto: CreateGeneroDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.generosService.create(createGeneroDto, BigInt(user.userId));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un género existente' })
  @ApiOkResponse({ type: GeneroResponseDto, description: 'Género actualizado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Género no encontrado' })
  @ApiConflictResponse({ description: 'El nombre ya está en uso' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  update(
    @Param('id') id: string,
    @Body() updateGeneroDto: UpdateGeneroDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.generosService.update(id, updateGeneroDto, BigInt(user.userId));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un género' })
  @ApiOkResponse({ type: DeleteResponseDto, description: 'Género eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Género no encontrado' })
  @ApiConflictResponse({
    description: 'No se puede eliminar porque tiene películas asociadas',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.generosService.remove(id, BigInt(user.userId));
  }
}
