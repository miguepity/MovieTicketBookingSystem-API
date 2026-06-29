import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from 'src/modules/auth/decorators/current-user.decorator';
import { SuscripcionesEstrenoService } from './suscripciones-estreno.service';

@ApiTags('suscripciones-estreno')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class SuscripcionesEstrenoController {
  constructor(private readonly svc: SuscripcionesEstrenoService) {}

  @Post('peliculas/:id/suscripcion-estreno')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suscribirse al aviso de estreno de una película' })
  @ApiOkResponse({ schema: { example: { subscribed: true } } })
  async subscribe(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    await this.svc.subscribe(BigInt(id), BigInt(u.userId));
    return { subscribed: true };
  }

  @Delete('peliculas/:id/suscripcion-estreno')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Quitar suscripción al aviso de estreno' })
  @ApiOkResponse({ schema: { example: { subscribed: false } } })
  async unsubscribe(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    await this.svc.unsubscribe(BigInt(id), BigInt(u.userId));
    return { subscribed: false };
  }

  @Get('me/suscripciones-estreno')
  @ApiOperation({ summary: 'IDs de películas a las que el usuario está suscrito' })
  @ApiOkResponse({ schema: { type: 'array', items: { type: 'string' } } })
  async list(@CurrentUser() u: CurrentUserPayload): Promise<string[]> {
    return this.svc.listarPorUsuario(BigInt(u.userId));
  }
}
