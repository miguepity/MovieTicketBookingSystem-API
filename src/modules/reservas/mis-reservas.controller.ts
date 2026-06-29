import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BoletoCodeService } from 'src/modules/boletos/boleto-code.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from 'src/modules/auth/decorators/current-user.decorator';
import { ReservasService } from './reservas.service';
import { BoletoResponseDto } from './dto/boleto.response.dto';
import { CancelarPorClienteResponseDto } from './dto/cancelar-por-cliente.response.dto';
import { ListMisReservasQueryDto } from './dto/list-mis-reservas-query.dto';
import { MisReservasPageResponseDto } from './dto/mis-reservas-page.response.dto';
import { ReenviarBoletoResponseDto } from './dto/reenviar-boleto.response.dto';

@ApiTags('me/reservas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me/reservas')
export class MisReservasController {
  constructor(
    private readonly reservas: ReservasService,
    private readonly codes: BoletoCodeService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar mis reservas (boletos) paginadas' })
  @ApiOkResponse({
    description: 'Página de reservas del usuario autenticado',
    type: MisReservasPageResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  list(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: ListMisReservasQueryDto,
  ) {
    return this.reservas.findMisReservas(user.userId, {
      page: query.page,
      limit: query.limit,
      estado: query.estado,
      vista: query.vista,
    });
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

  @Get(':numero/codigo-firmado')
  @ApiOperation({ summary: 'Código firmado y URL pública del PDF del boleto (para descarga + QR)' })
  async codigoFirmado(
    @CurrentUser() user: CurrentUserPayload,
    @Param('numero') numero: string,
  ): Promise<{ codigo: string; url: string }> {
    const reserva = await this.reservas.assertOwnership(numero, BigInt(user.userId));
    const codigo = this.codes.firmar(reserva.numero_reserva);
    const base = process.env.PDF_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    return { codigo, url: `${base}/boletos/${codigo}.pdf` };
  }

  @Post(':numero/reenviar-boleto')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reenviar boleto al email del usuario (cooldown 60s)' })
  @ApiOkResponse({ type: ReenviarBoletoResponseDto })
  async reenviarBoleto(
    @CurrentUser() user: CurrentUserPayload,
    @Param('numero') numero: string,
  ): Promise<ReenviarBoletoResponseDto> {
    const out = await this.reservas.reenviarBoletoUsuario(numero, BigInt(user.userId));
    if (!out.ok) {
      return { ok: false, retry_after: out.retry_after };
    }
    return { ok: true };
  }
}
