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
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CuponesService } from './cupones.service';
import { CreateCuponeDto } from './dto/create-cupones.dto';
import { UpdateCuponeDto } from './dto/update-cupones.dto';
import { ValidarCuponDto } from './dto/validar-cupon.dto';
import { ActualizarEstadoCuponDto } from './dto/actualizar-estado-cupon.dto';

@ApiTags('Cupones')
@Controller('cupones')
export class CuponesController {
  constructor(private readonly cuponesService: CuponesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un cupón de descuento' })
  create(@Body() createCuponeDto: CreateCuponeDto) {
    return this.cuponesService.create(createCuponeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los cupones' })
  findAll() {
    return this.cuponesService.findAll();
  }

  @Post('validar')
  @ApiOperation({ summary: 'Validar un cupón por código' })
  validar(@Body() validarCuponDto: ValidarCuponDto) {
    return this.cuponesService.validar(validarCuponDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cupón por ID' })
  @ApiParam({ name: 'id', description: 'ID del cupón' })
  findOne(@Param('id') id: string) {
    return this.cuponesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cupón' })
  @ApiParam({ name: 'id', description: 'ID del cupón' })
  update(@Param('id') id: string, @Body() updateCuponeDto: UpdateCuponeDto) {
    return this.cuponesService.update(+id, updateCuponeDto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Activar o desactivar un cupón' })
  @ApiParam({ name: 'id', description: 'ID del cupón' })
  cambiarEstado(
    @Param('id') id: string,
    @Body() actualizarEstadoDto: ActualizarEstadoCuponDto,
  ) {
    return this.cuponesService.cambiarEstado(+id, actualizarEstadoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un cupón' })
  @ApiParam({ name: 'id', description: 'ID del cupón' })
  remove(@Param('id') id: string) {
    return this.cuponesService.remove(+id);
  }
}
