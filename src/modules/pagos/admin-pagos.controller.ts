import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PagosService } from './pagos.service';
import { ListPagosQueryDto } from './dto/list-pagos-query.dto';

@ApiTags('admin/pagos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiUnauthorizedResponse({ description: 'No autorizado' })
@ApiForbiddenResponse({ description: 'Rol no autorizado' })
@Controller('admin/pagos')
export class AdminPagosController {
  constructor(private readonly pagos: PagosService) {}

  @Get()
  @ApiOperation({ summary: 'Listado paginado de todos los pagos (admin)' })
  @ApiOkResponse({ description: 'Página de pagos con datos de cliente y cine' })
  list(@Query() q: ListPagosQueryDto) {
    return this.pagos.findAdminPaginated(q);
  }

  @Get('reserva/:idReserva')
  @ApiOperation({ summary: 'Pagos de una reserva específica (admin)' })
  @ApiParam({ name: 'idReserva', description: 'ID numérico de la reserva' })
  @ApiOkResponse({ description: 'Array de pagos de la reserva' })
  @ApiNotFoundResponse({ description: 'Reserva no encontrada' })
  byReserva(@Param('idReserva') idReserva: string) {
    return this.pagos.findByReserva(BigInt(idReserva));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un pago por ID (admin)' })
  @ApiParam({ name: 'id', description: 'ID numérico del pago' })
  @ApiOkResponse({ description: 'Detalle del pago' })
  @ApiNotFoundResponse({ description: 'Pago no encontrado' })
  one(@Param('id') id: string) {
    return this.pagos.findOneAdmin(BigInt(id));
  }
}
