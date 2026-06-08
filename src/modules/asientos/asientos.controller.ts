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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
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
  getMapa(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.asientosService.getMapa(id, user.userId);
  }

  @Post('funciones/:id/asientos/bloquear')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
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
