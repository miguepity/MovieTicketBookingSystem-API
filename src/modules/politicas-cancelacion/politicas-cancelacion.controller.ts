import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PoliticasCancelacionService } from './politicas-cancelacion.service';
import { CreatePoliticaCancelacionDto } from './dto/create-politica-cancelacion.dto';
import { UpdatePoliticasCancelacionDto } from './dto/update-politicas-cancelacion.dto';
import { ListPoliticasCancelacionQueryDto } from './dto/list-politicas-cancelacion-query.dto';
import { PoliticasCancelacionPageResponseDto } from './dto/politicas-cancelacion-page.response.dto';

@ApiTags('Politicas de Cancelacion')
@Controller('politicas-cancelacion')
export class PoliticasCancelacionController {
  constructor(
    private readonly politicasCancelacionService: PoliticasCancelacionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar políticas (filtrable por cine y estado)' })
  @ApiOkResponse({ type: PoliticasCancelacionPageResponseDto })
  findAll(@Query() query: ListPoliticasCancelacionQueryDto) {
    return this.politicasCancelacionService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una política por ID' })
  @ApiOkResponse({ description: 'Política encontrada' })
  @ApiNotFoundResponse({ description: 'Política no encontrada' })
  findOne(@Param('id') id: string) {
    return this.politicasCancelacionService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva política activa para un cine' })
  @ApiCreatedResponse({ description: 'Política creada' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(
    @Body() dto: CreatePoliticaCancelacionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.politicasCancelacionService.create(dto, BigInt(user.userId));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar política (reemplaza reglas)' })
  @ApiOkResponse({ description: 'Política actualizada' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Política no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePoliticasCancelacionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.politicasCancelacionService.update(
      id,
      dto,
      BigInt(user.userId),
    );
  }

  @Patch(':id/desactivar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar política' })
  @ApiOkResponse({ description: 'Política desactivada' })
  @ApiNotFoundResponse({ description: 'Política no encontrada o ya inactiva' })
  desactivar(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.politicasCancelacionService.desactivar(id, BigInt(user.userId));
  }
}
