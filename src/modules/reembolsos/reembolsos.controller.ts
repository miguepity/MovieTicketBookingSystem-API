import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ReembolsosService } from './reembolsos.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from 'src/modules/auth/decorators/current-user.decorator';

@ApiTags('Reembolsos')
@Controller('reembolsos')
export class ReembolsosController {
  constructor(private readonly reembolsosService: ReembolsosService) {}

  @Post(':id/procesar-efectivo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Procesar reembolso en efectivo',
    description:
      'Marca un reembolso pendiente como procesado. Solo el rol admin está autorizado.',
  })
  @ApiParam({ name: 'id', description: 'ID del reembolso', example: '1' })
  @ApiOkResponse({ description: 'Reembolso procesado exitosamente' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  @ApiForbiddenResponse({
    description: 'Solo el rol admin puede procesar reembolsos en efectivo',
  })
  @ApiNotFoundResponse({ description: 'Reembolso no encontrado' })
  @ApiConflictResponse({
    description: 'El reembolso no está en estado pendiente',
  })
  procesarEfectivo(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reembolsosService.procesarEfectivo(id, BigInt(user.userId));
  }
}
