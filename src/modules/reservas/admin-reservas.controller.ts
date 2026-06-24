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
  ApiForbiddenResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from 'src/modules/auth/decorators/current-user.decorator';
import { ReservasService } from './reservas.service';
import { ListReservasQueryDto } from './dto/list-reservas-query.dto';

@ApiTags('admin/reservas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiUnauthorizedResponse({ description: 'No autorizado' })
@ApiForbiddenResponse({ description: 'Rol no autorizado' })
@Controller('admin/reservas')
export class AdminReservasController {
  constructor(private readonly reservas: ReservasService) {}

  @Get()
  @ApiOperation({ summary: 'Listado paginado de todas las reservas (admin)' })
  @ApiOkResponse({ description: 'Página de reservas con datos de cliente y película' })
  list(@Query() q: ListReservasQueryDto) {
    return this.reservas.findAdminPaginated(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una reserva por ID (admin)' })
  @ApiParam({ name: 'id', description: 'ID numérico de la reserva' })
  @ApiOkResponse({ description: 'Detalle de la reserva' })
  @ApiNotFoundResponse({ description: 'Reserva no encontrada' })
  one(@Param('id') id: string) {
    return this.reservas.findOneAdmin(BigInt(id));
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar una reserva por ID (admin). Crea reembolso si aplica.' })
  @ApiParam({ name: 'id', description: 'ID numérico de la reserva a cancelar' })
  @ApiOkResponse({ description: 'Reserva cancelada; reembolso creado si había pago' })
  @ApiNotFoundResponse({ description: 'Reserva no encontrada' })
  @ApiConflictResponse({ description: 'La reserva ya fue cancelada o no es cancelable' })
  cancelar(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reservas.cancelarAdminReserva(BigInt(id), user.userId);
  }
}
