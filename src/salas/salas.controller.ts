import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { SalaService } from './salas.service';
import { Param } from '@nestjs/common';
import { BodyDto } from './dto/salas.body.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@ApiTags('Salas')
@Controller('salas')
export class SalasController {
  constructor(private readonly salaService: SalaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva sala' })
  createSala(@Body() dto: BodyDto) {
    return this.salaService.createSala(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las salas' })
  getSalas() {
    return this.salaService.getSalas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sala por ID' })
  @ApiParam({ name: 'id', description: 'ID de la sala' })
  getSalaById(@Param('id', ParseIntPipe) id: number) {
    return this.salaService.getSalaById({ id });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una sala' })
  @ApiParam({ name: 'id', description: 'ID de la sala' })
  editSala(@Param('id', ParseIntPipe) id: number, @Body() dtoB: BodyDto) {
    return this.salaService.updateSala({ id }, dtoB);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualización parcial de una sala' })
  @ApiParam({ name: 'id', description: 'ID de la sala' })
  updateSala(
    @Param('id', ParseIntPipe) id: number,
    @Body() dtoB: UpdateSalaDto,
  ) {
    return this.salaService.updateSala({ id }, dtoB);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una sala' })
  @ApiParam({ name: 'id', description: 'ID de la sala' })
  deleteSala(@Param('id', ParseIntPipe) id: number) {
    return this.salaService.deleteSala({ id });
  }
}
