import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CuponesService } from './cupones.service';
import { CreateCuponeDto } from './dto/create-cupones.dto';
import { UpdateCuponeDto } from './dto/update-cupones.dto';
import { ValidarCuponDto } from './dto/validar-cupon.dto';
import { ActualizarEstadoCuponDto } from './dto/actualizar-estado-cupon.dto';

@Controller('cupones')
export class CuponesController {
  constructor(private readonly cuponesService: CuponesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCuponeDto: CreateCuponeDto) {
    return this.cuponesService.create(createCuponeDto);
  }

  @Get()
  findAll() {
    return this.cuponesService.findAll();
  }

  @Post('validar')
  validar(@Body() validarCuponDto: ValidarCuponDto) {
    return this.cuponesService.validar(validarCuponDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cuponesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCuponeDto: UpdateCuponeDto) {
    return this.cuponesService.update(+id, updateCuponeDto);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id') id: string,
    @Body() actualizarEstadoDto: ActualizarEstadoCuponDto,
  ) {
    return this.cuponesService.cambiarEstado(+id, actualizarEstadoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.cuponesService.remove(+id);
  }
}
