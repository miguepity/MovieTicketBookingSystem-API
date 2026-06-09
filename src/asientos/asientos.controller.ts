import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AsientosService } from './asientos.service';
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { UpdateAsientoDto } from './dto/update-asiento.dto';

@ApiTags('Asientos')
@Controller('asientos')
export class AsientosController {
  constructor(private readonly asientosService: AsientosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un asiento' })
  create(@Body() createAsientoDto: CreateAsientoDto) {
    return this.asientosService.create(createAsientoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los asientos' })
  findAll() {
    return this.asientosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un asiento por ID' })
  @ApiParam({ name: 'id', description: 'ID del asiento' })
  findOne(@Param('id') id: string) {
    return this.asientosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un asiento' })
  @ApiParam({ name: 'id', description: 'ID del asiento' })
  update(@Param('id') id: string, @Body() updateAsientoDto: UpdateAsientoDto) {
    return this.asientosService.update(+id, updateAsientoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un asiento' })
  @ApiParam({ name: 'id', description: 'ID del asiento' })
  remove(@Param('id') id: string) {
    return this.asientosService.remove(+id);
  }
}
