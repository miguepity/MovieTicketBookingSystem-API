import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PagosService } from './pagos.service';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { CrearPagoEfectivoDto } from './dto/crear-pago-efectivo.dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from 'src/modules/auth/decorators/current-user.decorator';

@ApiTags('Pagos')
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
