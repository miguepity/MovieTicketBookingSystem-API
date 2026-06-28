import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PagosService } from './pagos.service';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { CrearPagoEfectivoDto } from './dto/crear-pago-efectivo.dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from 'src/modules/auth/decorators/current-user.decorator';
import { PagoCreatedResponseDto } from './dto/pago.response.dto';

@ApiTags('Pagos')
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un pago para una reserva' })
  @ApiCreatedResponse({ type: PagoCreatedResponseDto, description: 'Pago procesado exitosamente' })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o cupón no válido',
  })
  @ApiNotFoundResponse({ description: 'La reserva no existe' })
  @ApiConflictResponse({
    description:
      'La reserva no es pagable o el cine no tiene precio configurado',
  })
  @ApiForbiddenResponse({ description: 'Esta reserva no te pertenece' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  crear(@Body() dto: CrearPagoDto, @CurrentUser() user: CurrentUserPayload) {
    return this.pagosService.crear({
      idReserva: dto.id_reserva,
      idUsuarioActual: user.userId,
      metodo: dto.metodo,
      referenciaExterna: dto.referencia_externa,
      codigoCupon: dto.codigo_cupon,
    });
  }

  @Post('efectivo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar un pago en efectivo (solo admin (caja))' })
  @ApiCreatedResponse({ type: PagoCreatedResponseDto, description: 'Pago en efectivo registrado exitosamente' })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o cupón no válido',
  })
  @ApiNotFoundResponse({ description: 'La reserva no existe' })
  @ApiConflictResponse({
    description:
      'La reserva no es pagable o el cine no tiene precio configurado',
  })
  @ApiForbiddenResponse({
    description: 'Solo el rol admin (caja) puede confirmar pagos en efectivo',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  crearEfectivo(
    @Body() dto: CrearPagoEfectivoDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.pagosService.crearEfectivo({
      idReserva: dto.id_reserva,
      idUsuarioActual: user.userId,
      codigoCupon: dto.codigo_cupon,
    });
  }
}
