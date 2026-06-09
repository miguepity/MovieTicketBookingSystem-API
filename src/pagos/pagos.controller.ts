import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { CreatePagoEfectivoDto } from './dto/create-pago-efectivo.dto';

@ApiTags('Pagos')
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un pago con tarjeta o método digital' })
  async create(@Body() createPagoDto: CreatePagoDto) {
    return await this.pagosService.create(createPagoDto);
  }

  @Post('efectivo')
  @ApiOperation({ summary: 'Registrar un pago en efectivo (solo recepcionista)' })
  async pagoEfectivo(@Body() dto: CreatePagoEfectivoDto) {
    return await this.pagosService.pagoEfectivo(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pago por ID' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.pagosService.findOne(id);
  }
}
