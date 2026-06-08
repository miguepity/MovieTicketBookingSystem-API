import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
} from '@nestjs/common';
import { CuponesService } from './cupones.service';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('cupones')
export class CuponesController {
  constructor(private readonly cuponesService: CuponesService) {}

  @Get()
  findAll() {
    return this.cuponesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cuponesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  create(@Body() dto: CreateCuponDto) {
    return this.cuponesService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() dto: UpdateCuponDto) {
    return this.cuponesService.update(id, dto);
  }

  @Post('validar')
  @HttpCode(HttpStatus.OK)
  validar(@Body() body: { codigo: string }) {
    return this.cuponesService.validar(body.codigo);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  toggleStatus(@Param('id') id: string) {
    return this.cuponesService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.cuponesService.remove(id);
  }
}
