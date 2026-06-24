import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from 'src/modules/auth/decorators/current-user.decorator';
import { ReembolsosService } from './reembolsos.service';

@ApiTags('me/reembolsos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me/reembolsos')
export class MisReembolsosController {
  constructor(private readonly reembolsosService: ReembolsosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar mis reembolsos' })
  @ApiOkResponse({ description: 'Lista de reembolsos del usuario autenticado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.reembolsosService.findMisReembolsos(user.userId);
  }
}
