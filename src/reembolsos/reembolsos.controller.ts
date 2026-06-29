import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Patch
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ReembolsosService } from './reembolsos.services';
import { ReembolsosBodyDto } from './dto/reembolsos.body.dto';
import { FilterBodyDto } from './dto/reembolsos.filters.dto';

@ApiTags('Reembolsos')
@Controller('reembolso')
export class ReembolsosController {
  constructor(private readonly reembolsoService: ReembolsosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una solicitud de reembolso' })
  createRembolso(@Body() dto: ReembolsosBodyDto) {
    return this.reembolsoService.createRembolso(dto);
  }

  @Get('pagos')
  @ApiOperation({ summary: 'Obtener historial de pagos con filtros' })
  getPaymentHistory(@Query() dto: FilterBodyDto) {
    return this.reembolsoService.getPaymentHistory(dto);
  }

  @Get(':id/calculo')
  @ApiOperation({ summary: 'Calcular monto de reembolso para una reserva' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  calculoDeReembolso(@Param('id', ParseIntPipe) id: number) {
    return this.reembolsoService.calcularReembolso(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un reembolso por ID' })
  @ApiParam({ name: 'id', description: 'Actualizar estado del reembolso' })
  async updatePago(@Param('id', ParseIntPipe) id: number, @Body('estado') estado: string) {
    return await this.reembolsoService.cambiarEstadorReembolso(id, estado);
  }
}
