import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Crear una reserva a partir de asientos bloqueados' })
  @ApiCreatedResponse({ description: 'Reserva creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({
    description: 'La función no existe o algún asiento no pertenece a la función',
  })
  @ApiConflictResponse({
    description:
      'El bloqueo ya no es válido, expiró o el cine no tiene precio configurado',
  })
  @ApiForbiddenResponse({
    description: 'No podés reservar bloqueos de otro usuario',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
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
  @ApiOperation({ summary: 'Cancelar una reserva' })
  @ApiParam({ name: 'id', description: 'ID de la reserva', example: '1' })
  @ApiOkResponse({ description: 'Reserva cancelada exitosamente' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  @ApiNotFoundResponse({ description: 'La reserva no existe' })
  @ApiConflictResponse({
    description: 'La reserva ya fue cancelada o cambió de estado',
  })
  @ApiForbiddenResponse({ description: 'Esta reserva no te pertenece' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  cancelar(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.reservasService.cancelar(id, user.userId);
  }
}
