import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReservasService } from './reservas.service';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from 'src/modules/auth/decorators/current-user.decorator';

@ApiTags('Reservas')
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  crear(@Body() dto: CrearReservaDto, @CurrentUser() user: CurrentUserPayload) {
    return this.reservasService.crear(
      dto.id_funcion,
      dto.ids_asiento_funcion,
      user.userId,
    );
  }

  @Patch(':id/cancelar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  cancelar(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.reservasService.cancelar(id, user.userId);
  }
}
