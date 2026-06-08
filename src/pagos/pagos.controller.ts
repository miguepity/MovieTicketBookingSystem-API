import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PagosService } from './pagos.service';
import { CreatePagosDto } from './dtos/create-pagos.dto';
import { CreatePagoEfectivoDto } from './dtos/create-pagos-efectivo.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Pagos')
@Controller('pagos')
@ApiBearerAuth()
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @ApiOperation({ summary: 'Procesar pago de una reserva' })
  @ApiResponse({ status: 201, description: 'Pago procesado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error al procesar el pago.' })
  async crearPago(
    @Body() createPagoDto: CreatePagosDto,
    @Req() req: any
  ) { 
    
    return await this.pagosService.procesarPago(createPagoDto);
  }

  @Post('efectivo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPCIONISTA', 'ADMIN') 
  async crearPagoEfectivo(@Body() createPagoEfectivoDto: CreatePagoEfectivoDto) {
    return await this.pagosService.procesarPagoEfectivo(createPagoEfectivoDto);
  }
}