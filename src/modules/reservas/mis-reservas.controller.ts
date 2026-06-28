import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from 'src/modules/auth/decorators/current-user.decorator';
import { ReservasService } from './reservas.service';
import { BoletoResponseDto } from './dto/boleto.response.dto';
import { CancelarPorClienteResponseDto } from './dto/cancelar-por-cliente.response.dto';

@ApiTags('me/reservas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me/reservas')
export class MisReservasController {
  constructor(private readonly reservas: ReservasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar mis reservas (boletos)' })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado (pendiente_pago, pagada, cancelada, …)',
  })
  @ApiOkResponse({
    description: 'Lista de reservas del usuario autenticado',
    type: BoletoResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  list(
    @CurrentUser() user: CurrentUserPayload,
    @Query('estado') estado?: string,
  ) {
    return this.reservas.findMisReservas(user.userId, estado);
  }

  @Get(':numero')
  @ApiOperation({ summary: 'Detalle de una reserva por número' })
  @ApiParam({ name: 'numero', description: 'Número de reserva (ej. RES-20260101-ABCDE)' })
  @ApiOkResponse({
    description: 'Boleto encontrado',
    type: BoletoResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Reserva no encontrada o no pertenece al usuario' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  one(
    @CurrentUser() user: CurrentUserPayload,
    @Param('numero') numero: string,
  ) {
    return this.reservas.findOneByNumero(numero, user.userId);
  }

  @Patch(':numero/cancelar')
  @ApiOperation({ summary: 'Cancelar una reserva propia (por número)' })
  @ApiParam({ name: 'numero', description: 'Número de reserva a cancelar' })
  @ApiOkResponse({
    description: 'Reserva cancelada; reembolso creado si aplica',
    type: CancelarPorClienteResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Reserva no encontrada o no pertenece al usuario' })
  @ApiConflictResponse({ description: 'La reserva ya fue cancelada o no es cancelable' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  cancelar(
    @CurrentUser() user: CurrentUserPayload,
    @Param('numero') numero: string,
  ) {
    return this.reservas.cancelarPorCliente(numero, user.userId);
  }
}
