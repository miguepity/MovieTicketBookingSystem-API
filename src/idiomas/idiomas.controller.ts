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
import { IdiomasService } from './idiomas.service';
import { CreateIdiomaDto } from './dto/create-idioma.dto';
import { UpdateIdiomaDto } from './dto/update-idioma.dto';

@ApiTags('Idiomas')
@Controller('idiomas')
export class IdiomasController {
  constructor(private readonly idiomasService: IdiomasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un idioma' })
  create(@Body() createIdiomaDto: CreateIdiomaDto) {
    return this.idiomasService.create(createIdiomaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los idiomas' })
  findAll() {
    return this.idiomasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un idioma por ID' })
  @ApiParam({ name: 'id', description: 'ID del idioma' })
  findOne(@Param('id') id: string) {
    return this.idiomasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un idioma' })
  @ApiParam({ name: 'id', description: 'ID del idioma' })
  update(@Param('id') id: string, @Body() updateIdiomaDto: UpdateIdiomaDto) {
    return this.idiomasService.update(+id, updateIdiomaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un idioma' })
  @ApiParam({ name: 'id', description: 'ID del idioma' })
  remove(@Param('id') id: string) {
    return this.idiomasService.remove(+id);
  }
}
