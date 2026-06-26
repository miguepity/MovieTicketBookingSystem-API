import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from 'src/modules/auth/decorators/current-user.decorator';
import { PreciosCineService } from './precios-cine.service';
import { GuardarMatrizDto } from './dto/guardar-matriz.dto';
import { MatrizPreciosResponseDto, PrecioCineByCineResponseDto } from './dto/precio-cine.response.dto';

@ApiTags('admin/precios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiUnauthorizedResponse({ description: 'No autorizado' })
@ApiForbiddenResponse({ description: 'Rol no autorizado' })
@Controller('admin/precios')
export class PreciosMatrizController {
  constructor(private readonly svc: PreciosCineService) {}

  @Get('matriz')
  @ApiOperation({ summary: 'Obtener la matriz completa de precios por cine y tipo de asiento' })
  @ApiOkResponse({ type: MatrizPreciosResponseDto, description: 'Matriz de precios' })
  getMatriz() {
    return this.svc.getMatriz();
  }

  @Post('matriz')
  @ApiOperation({ summary: 'Guardar la matriz completa de precios (defaults + por cine)' })
  @ApiOkResponse({ type: MatrizPreciosResponseDto, description: 'Matriz de precios actualizada' })
  guardarMatriz(
    @Body() dto: GuardarMatrizDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.guardarMatriz(dto, BigInt(user.userId));
  }

  @Get('cine/:idCine')
  @ApiOperation({ summary: 'Obtener precios de un cine específico' })
  @ApiOkResponse({ type: PrecioCineByCineResponseDto, isArray: true, description: 'Precios del cine' })
  findByCine(@Param('idCine') idCine: string) {
    return this.svc.findByCine(BigInt(idCine));
  }
}
