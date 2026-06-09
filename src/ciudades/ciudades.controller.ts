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
import { CiudadesService } from './ciudades.service';
import { CreateCiudadeDto } from './dto/create-ciudade.dto';
import { UpdateCiudadeDto } from './dto/update-ciudade.dto';

@ApiTags('Ciudades')
@Controller('ciudades')
export class CiudadesController {
  constructor(private readonly ciudadesService: CiudadesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una ciudad' })
  create(@Body() createCiudadeDto: CreateCiudadeDto) {
    return this.ciudadesService.create(createCiudadeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las ciudades' })
  findAll() {
    return this.ciudadesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ciudad por ID' })
  @ApiParam({ name: 'id', description: 'ID de la ciudad' })
  findOne(@Param('id') id: string) {
    return this.ciudadesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una ciudad' })
  @ApiParam({ name: 'id', description: 'ID de la ciudad' })
  update(@Param('id') id: string, @Body() updateCiudadeDto: UpdateCiudadeDto) {
    return this.ciudadesService.update(+id, updateCiudadeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una ciudad' })
  @ApiParam({ name: 'id', description: 'ID de la ciudad' })
  remove(@Param('id') id: string) {
    return this.ciudadesService.remove(+id);
  }
}
