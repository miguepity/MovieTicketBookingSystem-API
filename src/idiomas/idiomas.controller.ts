import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IdiomasService } from './idiomas.service';
import { CreateIdiomaDto } from './create-idiomas.dto';
import { UpdateIdiomaDto } from './update-idiomas.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Idiomas y Doblajes')
@Controller('idiomas')
export class IdiomasController {
  constructor(private readonly idiomasService: IdiomasService) {}

  @Post()
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Registrar un nuevo idioma ' })
  @ApiResponse({ status: 201, description: 'Idioma creado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 409, description: 'El nombre del idioma ya existe.' })
  create(@Body() createIdiomaDto: CreateIdiomaDto, @Req() req: any) {
    return this.idiomasService.create(createIdiomaDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los idiomas ' })
  @ApiResponse({ status: 200, description: 'Lista de idiomas retornada con éxito.' })
  @ApiResponse({ status: 404, description: 'No se encontraron idiomas.' })
  findAll() {
    return this.idiomasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un idioma por ID ' })
  @ApiResponse({ status: 200, description: 'Idioma encontrado.' })
  @ApiResponse({ status: 404, description: 'Idioma no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.idiomasService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar un idioma por ID ' })
  @ApiResponse({ status: 200, description: 'Idioma actualizado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 404, description: 'Idioma no encontrado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateIdiomaDto: UpdateIdiomaDto, @Req() req: any) {
    return this.idiomasService.update(id, updateIdiomaDto, req.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth('token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un idioma por ID ' })
  @ApiResponse({ status: 200, description: 'Idioma eliminado con éxito.' })
  @ApiResponse({ status: 404, description: 'Idioma no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.idiomasService.remove(id, req.user.id);
  }
}