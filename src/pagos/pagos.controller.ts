import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { CreatePagoEfectivoDto } from './dto/create-pago-efectivo.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  async create(@Body() createPagoDto: CreatePagoDto) {
    return await this.pagosService.create(createPagoDto);
  }

  @Post('efectivo')
  async pagoEfectivo(@Body() dto: CreatePagoEfectivoDto) {
    return await this.pagosService.pagoEfectivo(dto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.pagosService.findOne(id);
  }
}
