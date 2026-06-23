import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AsientosService } from './asientos.service';
import { BloquearAsientosDto } from './dto/bloquear-asientos.dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from 'src/modules/auth/decorators/current-user.decorator';

@ApiTags('Asientos')
@Controller()
export class AsientosController {
  constructor(private readonly asientosService: AsientosService) {}

  @Get('funciones/:id/asientos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el mapa de asientos de una función' })
  @ApiParam({ name: 'id', description: 'ID de la función', example: '1' })
  @ApiOkResponse({ description: 'Mapa de asientos de la función' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  @ApiNotFoundResponse({ description: 'La función no existe' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  getMapa(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.asientosService.getMapa(id, user.userId);
  }

  @Post('funciones/:id/asientos/bloquear')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bloquear asientos de una función para el usuario actual',
  })
  @ApiParam({ name: 'id', description: 'ID de la función', example: '1' })
  @ApiOkResponse({ description: 'Asientos bloqueados exitosamente' })
  @ApiBadRequestResponse({
    description:
      'Datos inválidos o uno o más asientos no pertenecen a la función',
  })
  @ApiNotFoundResponse({ description: 'La función no existe' })
  @ApiConflictResponse({
    description: 'Uno o más asientos ya no están disponibles',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  bloquear(
    @Param('id') id: string,
    @Body() dto: BloquearAsientosDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.asientosService.bloquear(
      id,
      dto.ids_asiento_funcion,
      user.userId,
    );
  }
}
