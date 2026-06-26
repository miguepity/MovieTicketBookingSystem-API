import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { ReplaceReglasDto, SetActivaDto } from './dto/regla-politica.dto';
import { PoliticaSimpleResponseDto } from './dto/politica-simple.response.dto';
import { ReglaPoliticaResponseDto } from './dto/politicas-cancelacion-list-item.response.dto';

@ApiTags('Reglas de Política de Cancelación')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/politicas-cancelacion')
export class ReglasPoliticaController {
  constructor(
    private readonly svc: PoliticasCancelacionService,
  ) {}

  @Get('cine/:idCine')
  @ApiOperation({ summary: 'Listar políticas de cancelación por cine' })
  @ApiOkResponse({ type: PoliticaSimpleResponseDto, isArray: true, description: 'Lista de políticas del cine' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  listByCine(@Param('idCine') idCine: string) {
    return this.svc.listByCine(BigInt(idCine));
  }

  @Get(':id/reglas')
  @ApiOperation({ summary: 'Listar reglas de una política' })
  @ApiOkResponse({ type: ReglaPoliticaResponseDto, isArray: true, description: 'Lista de reglas ordenadas por horas_antes_minimo' })
  @ApiNotFoundResponse({ description: 'Política no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  listReglas(@Param('id') id: string) {
    return this.svc.listReglas(BigInt(id));
  }

  @Patch(':id/reglas')
  @ApiOperation({ summary: 'Reemplazar todas las reglas de una política (atómico)' })
  @ApiOkResponse({ type: ReglaPoliticaResponseDto, isArray: true, description: 'Reglas reemplazadas' })
  @ApiBadRequestResponse({ description: 'Reglas inválidas (solapadas o min >= max)' })
  @ApiNotFoundResponse({ description: 'Política no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  replaceReglas(
    @Param('id') id: string,
    @Body() dto: ReplaceReglasDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.replaceReglas(BigInt(id), dto, BigInt(user.userId));
  }

  @Patch(':id/activa')
  @ApiOperation({ summary: 'Activar o desactivar una política (activar desactiva las demás del mismo cine)' })
  @ApiOkResponse({ type: PoliticaSimpleResponseDto, description: 'Política actualizada' })
  @ApiNotFoundResponse({ description: 'Política no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  setActiva(
    @Param('id') id: string,
    @Body() dto: SetActivaDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.setActiva(BigInt(id), dto.activa, BigInt(user.userId));
  }
}
