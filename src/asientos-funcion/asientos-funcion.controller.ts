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
import { AsientosFuncionService } from './asientos-funcion.service';
import { CreateAsientosFuncionDto } from './dto/create-asientos-funcion.dto';
import { UpdateAsientosFuncionDto } from './dto/update-asientos-funcion.dto';

@Controller('asientos-funcion')
export class AsientosFuncionController {
  constructor(
    private readonly asientosFuncionService: AsientosFuncionService,
  ) {}

  @Post()
  create(@Body() createAsientosFuncionDto: CreateAsientosFuncionDto) {
    return this.asientosFuncionService.create(createAsientosFuncionDto);
  }

  @Get()
  findAll() {
    return this.asientosFuncionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asientosFuncionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsientosFuncionDto: UpdateAsientosFuncionDto,
  ) {
    return this.asientosFuncionService.update(id, updateAsientosFuncionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asientosFuncionService.remove(id);
  }
}
