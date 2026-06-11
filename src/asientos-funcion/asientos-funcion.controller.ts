import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AsientosFuncionService } from './asientos-funcion.service';
import { CreateAsientosFuncionDto } from './dto/create-asientos-funcion.dto';
import { UpdateAsientosFuncionDto } from './dto/update-asientos-funcion.dto';

@ApiTags('Asientos por Función')
@Controller('asientos-funcion')
export class AsientosFuncionController {
  constructor(
    private readonly asientosFuncionService: AsientosFuncionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un asiento en una función' })
  create(@Body() createAsientosFuncionDto: CreateAsientosFuncionDto) {
    return this.asientosFuncionService.create(createAsientosFuncionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los asientos de funciones' })
  findAll() {
    return this.asientosFuncionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un asiento de función por ID' })
  @ApiParam({ name: 'id', description: 'ID del asiento-función' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asientosFuncionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar el estado de un asiento en una función',
  })
  @ApiParam({ name: 'id', description: 'ID del asiento-función' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsientosFuncionDto: UpdateAsientosFuncionDto,
  ) {
    return this.asientosFuncionService.update(id, updateAsientosFuncionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un asiento de función' })
  @ApiParam({ name: 'id', description: 'ID del asiento-función' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asientosFuncionService.remove(id);
  }
}
