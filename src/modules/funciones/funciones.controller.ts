import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FuncionesService } from './funciones.service';
import { CreateFuncionDto } from './dto/create-funcion.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@Controller('funciones')
export class FuncionesController {
  constructor(private readonly funcionesService: FuncionesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  create(@Body() dto: CreateFuncionDto) {
    return this.funcionesService.create(dto);
  }

  @Get()
  findAll() {
    return this.funcionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.funcionesService.findOne(id);
  }
}
