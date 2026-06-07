import {
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CineService } from './cine.service';
import { CreateCineDto } from './dto/create-cine.dto';
import { ListCinesQueryDto } from './dto/list-cines-query.dto';
import { CineCreatedResponseDto } from './dto/cine-created-response.dto';
import { CinesPageResponseDto } from './dto/cines-page.response.dto';
import { UpdateCineDto } from './dto/update-cine.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Cines')
@Controller('cine')
export class CineController {
  constructor(private readonly cineService: CineService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un cine' })
  @ApiCreatedResponse({ type: CreateCineDto })
  @ApiBadRequestResponse({
    description: 'Ciudad inexistente o payload invalido',
  })
  @ApiConflictResponse({ description: 'Miembro duplicado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(
    @Body() createCineDto: CreateCineDto,
  ): Promise<CineCreatedResponseDto> {
    return this.cineService.create(createCineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar Cines' })
  @ApiOkResponse({ type: CinesPageResponseDto })
  findAll(@Query() query: ListCinesQueryDto): Promise<CinesPageResponseDto> {
    return this.cineService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cine por ID' })
  @ApiBadRequestResponse({ description: 'ID de cine inválido' })
  @ApiOkResponse({ type: CineCreatedResponseDto })
  findOne(@Param('id') id: string) {
    return this.cineService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cine' })
  @ApiOkResponse({ description: 'Cine actualizado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Cine no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateCineDto: UpdateCineDto) {
    return this.cineService.update(id, updateCineDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar un cine' })
  @ApiOkResponse({ description: 'Cine eliminado exitosamente.' })
  
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  remove(@Param('id') id: string) {
    return this.cineService.remove(id);
  }
}
