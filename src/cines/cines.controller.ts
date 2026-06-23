import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CineService } from './cines.service';
import { CreateCineDto } from './dto/cine.body.dto';
import { UpdateCineDto } from './dto/update-cine.dto';

@ApiTags('Cines')
@Controller('cines')
export class CineController {
  constructor(private readonly cineService: CineService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo cine' })
  createCine(@Body() dto: CreateCineDto) {
    return this.cineService.createCine(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los cines' })
  findAll() {
    return this.cineService.findAll();
  }

  @Get(':id/funciones')
  @ApiOperation({ summary: 'Obtener funciones disponibles de un cine' })
  @ApiParam({ name: 'id', description: 'ID del cine' })
  getFuncionesDisponibles(@Param('id', ParseIntPipe) id: number) {
    return this.cineService.getFuncionesDisponibles(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar datos de un cine' })
  @ApiParam({ name: 'id', description: 'ID del cine' })
  editCine(@Param('id', ParseIntPipe) id: number, @Body() dtoB: UpdateCineDto) {
    return this.cineService.editCine({ id }, dtoB);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualización parcial de datos de un cine' })
  @ApiParam({ name: 'id', description: 'ID del cine' })
  updateCine(
    @Param('id', ParseIntPipe) id: number,
    @Body() dtoB: UpdateCineDto,
  ) {
    return this.cineService.editCine({ id }, dtoB);
  }
}
